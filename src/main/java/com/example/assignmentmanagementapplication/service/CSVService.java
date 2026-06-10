package com.example.assignmentmanagementapplication.service;

import com.example.assignmentmanagementapplication.model.Assignment;
import com.example.assignmentmanagementapplication.model.Submission;
import com.example.assignmentmanagementapplication.model.Subject;
import com.example.assignmentmanagementapplication.model.User;
import com.example.assignmentmanagementapplication.model.UserRole;
import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.opencsv.exceptions.CsvException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class CSVService {

    @Autowired
    private UserService userService;

    @Autowired
    private SubjectService subjectService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private SubmissionService submissionService;


    public byte[] exportUsersToCSV() throws IOException {
        List<User> users = userService.findAll();
        StringWriter stringWriter = new StringWriter();
        CSVWriter csvWriter = new CSVWriter(stringWriter);

        String[] header = {"ID", "Име", "Презиме", "Email", "Улога", "Индекс", "Креирано"};
        csvWriter.writeNext(header);

        for (User user : users) {
            String[] data = {
                    user.getId() != null ? user.getId().toString() : "",
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getRole() != null ? user.getRole().toString() : "",
                    user.getIndexNumber() != null ? user.getIndexNumber() : "",
                    user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
            };
            csvWriter.writeNext(data);
        }
        csvWriter.close();
        return stringWriter.toString().getBytes();
    }


    public byte[] exportAssignmentResultsToCSV(Long assignmentId) throws IOException {
        try {
            List<Submission> submissions = submissionService.findByAssignmentId(assignmentId);
            Assignment assignment = assignmentService.findById(assignmentId)
                    .orElseThrow(() -> new RuntimeException("Assignment не е пронајден"));

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();


            outputStream.write(0xEF);
            outputStream.write(0xBB);
            outputStream.write(0xBF);


            OutputStreamWriter writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8);
            CSVWriter csvWriter = new CSVWriter(writer);


            String[] header = {"Assignment", "Студент", "Email", "Индекс", "Оценка", "Коментари", "Поднесено", "Оценето"};
            csvWriter.writeNext(header);

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

            for (Submission submission : submissions) {
                User student = submission.getStudent();
                if (student == null) {
                    continue;
                }

                String[] data = {
                        assignment.getTitle() != null ? assignment.getTitle() : "",
                        student.getFullName() != null ? student.getFullName() : "",
                        student.getEmail() != null ? student.getEmail() : "",
                        student.getIndexNumber() != null ? student.getIndexNumber() : "",
                        submission.getGrade() != null ? submission.getGrade().toString() : "Не оценето",
                        submission.getComments() != null ? submission.getComments() : "",
                        submission.getSubmittedAt() != null ? submission.getSubmittedAt().format(fmt) : "",
                        submission.getGradedAt() != null ? submission.getGradedAt().format(fmt) : ""
                };
                csvWriter.writeNext(data);
            }


            csvWriter.close();
            writer.close();

            return outputStream.toByteArray();

        } catch (Exception e) {

            System.err.println("Error in exportAssignmentResultsToCSV: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("Failed to generate CSV export", e);
        }
    }


    public byte[] exportSubjectResultsToCSV(Long subjectId) throws IOException {
        List<Assignment> assignments = subjectService.findAssignmentsBySubjectId(subjectId);
        Subject subject = subjectService.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Предметот не е пронајден"));

        StringWriter stringWriter = new StringWriter();
        CSVWriter csvWriter = new CSVWriter(stringWriter);

        List<String> headerList = new ArrayList<>();
        headerList.add("Студент");
        headerList.add("Email");
        headerList.add("Индекс");

        for (Assignment assignment : assignments) {
            headerList.add(assignment.getTitle() + " (" + assignment.getMaxPoints() + "pt)");
        }
        headerList.add("Вкупно поени");
        headerList.add("Просек");
        csvWriter.writeNext(headerList.toArray(new String[0]));

        Set<User> studentSet = new HashSet<>();
        for (Assignment a : assignments) {
            List<Submission> subs = submissionService.findByAssignmentId(a.getId());
            for (Submission s : subs) {
                if (s.getStudent() != null) studentSet.add(s.getStudent());
            }
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

        for (User student : studentSet) {
            List<String> rowData = new ArrayList<>();
            rowData.add(student.getFullName());
            rowData.add(student.getEmail());
            rowData.add(student.getIndexNumber() != null ? student.getIndexNumber() : "");

            int totalPoints = 0;
            int gradedAssignments = 0;

            for (Assignment assignment : assignments) {
                Submission submission = submissionService.findByStudentAndAssignment(student.getId(), assignment.getId()).orElse(null);
                if (submission != null && submission.getGrade() != null) {
                    rowData.add(submission.getGrade().toString());
                    totalPoints += submission.getGrade();
                    gradedAssignments++;
                } else {
                    rowData.add("Не поднесено");
                }
            }

            rowData.add(String.valueOf(totalPoints));
            rowData.add(gradedAssignments > 0 ? String.format("%.2f", (double) totalPoints / gradedAssignments) : "0");
            csvWriter.writeNext(rowData.toArray(new String[0]));
        }
        csvWriter.close();
        return stringWriter.toString().getBytes();
    }


    public List<String> importStudentsFromCSV(MultipartFile file) throws IOException, CsvException {
        List<String> results = new ArrayList<>();

        try (CSVReader csvReader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> records = csvReader.readAll();

            if (records.isEmpty()) {
                results.add("CSV датотеката е празна");
                return results;
            }

            boolean isFirstRow = true;
            int successCount = 0;
            int errorCount = 0;

            Map<String, Integer> columnMap = new HashMap<>();

            for (String[] record : records) {
                if (isFirstRow) {
                    for (int i = 0; i < record.length; i++) {
                        columnMap.put(record[i].trim().toLowerCase(), i);
                    }
                    isFirstRow = false;
                    continue;
                }

                try {
                    String email = getStringValue(record, columnMap, "email");
                    if (email.isEmpty()) {
                        results.add("Пропуштен ред без email");
                        errorCount++;
                        continue;
                    }

                    Optional<User> existingUserOpt = userService.findByEmail(email);
                    User userToSave;

                    if (existingUserOpt.isPresent()) {

                        User existing = existingUserOpt.get();
                        existing.setFirstName(getStringValue(record, columnMap, "firstname", "име"));
                        existing.setLastName(getStringValue(record, columnMap, "lastname", "презиме"));
                        existing.setIndexNumber(getStringValue(record, columnMap, "indexnumber", "индекс"));

                        String createdAtStr = getStringValue(record, columnMap, "createdat", "created_at");
                        if (!createdAtStr.isEmpty()) {
                            try {
                                existing.setCreatedAt(LocalDateTime.parse(createdAtStr));
                            } catch (Exception e) {
                                existing.setCreatedAt(LocalDateTime.now());
                            }
                        } else if (existing.getCreatedAt() == null) {
                            existing.setCreatedAt(LocalDateTime.now());
                        }

                        existing.setPassword("defaultPassword123");

                        userToSave = existing;

                        results.add("Updated existing student: " + email);
                    } else {

                        User newUser = new User();
                        newUser.setFirstName(getStringValue(record, columnMap, "firstname", "име"));
                        newUser.setLastName(getStringValue(record, columnMap, "lastname", "презиме"));
                        newUser.setEmail(email);
                        newUser.setRole(UserRole.СТУДЕНТ);
                        newUser.setIndexNumber(getStringValue(record, columnMap, "indexnumber", "индекс"));

                        String createdAtStr = getStringValue(record, columnMap, "createdat", "created_at");
                        if (!createdAtStr.isEmpty()) {
                            try {
                                newUser.setCreatedAt(LocalDateTime.parse(createdAtStr));
                            } catch (Exception e) {
                                newUser.setCreatedAt(LocalDateTime.now());
                            }
                        } else {
                            newUser.setCreatedAt(LocalDateTime.now());
                        }

                        newUser.setPassword("defaultPassword123");

                        userToSave = newUser;

                        results.add("Added new student: " + email);
                    }

                    // Save the managed or new entity
                    userService.save(userToSave);
                    successCount++;
                } catch (Exception e) {
                    results.add("Грешка при додавање на студент: " + e.getMessage());
                    errorCount++;
                }
            }

            results.add(0, "Успешно додадени/ажурирани: " + successCount + " студенти");
            results.add("Грешки: " + errorCount);

        } catch (Exception e) {
            results.add("Грешка при обработка на CSV датотеката: " + e.getMessage());
        }
        return results;
    }



    public List<String> importUsersFromCSV(MultipartFile file) throws IOException, CsvException {
        List<String> results = new ArrayList<>();

        try (CSVReader csvReader = new CSVReader(new InputStreamReader(file.getInputStream(), "Windows-1251"))) {
            List<String[]> records = csvReader.readAll();

            if (records.isEmpty()) {
                results.add("CSV датотеката е празна");
                return results;
            }

            boolean isFirstRow = true;
            int successCount = 0;
            int errorCount = 0;

            Map<String, Integer> columnMap = new HashMap<>();

            for (String[] record : records) {
                if (isFirstRow) {

                    for (int i = 0; i < record.length; i++) {
                        String columnName = record[i].trim().toLowerCase();
                        columnMap.put(columnName, i);
                    }
                    isFirstRow = false;
                    continue;
                }

                try {
                    User user = new User();


//                    user.setId(getLongValue(record, columnMap, "id"));
                    user.setFirstName(getStringValue(record, columnMap, "firstname", "име"));
                    user.setLastName(getStringValue(record, columnMap, "lastname", "презиме"));
                    user.setEmail(getStringValue(record, columnMap, "email"));


                    String roleStr = getStringValue(record, columnMap, "role", "улога");
                    System.out.println("DEBUG: Role value from CSV: '" + roleStr + "'");

                    if (!roleStr.isEmpty()) {

                        String normalizedRole;

                        if (roleStr.equalsIgnoreCase("CTV, JEHT") || roleStr.equalsIgnoreCase("СТУДЕНТ")) {
                            normalizedRole = "СТУДЕНТ";
                        } else if (roleStr.equalsIgnoreCase("HACTABHИK") || roleStr.equalsIgnoreCase("НАСТАВНИК")) {
                            normalizedRole = "НАСТАВНИК";
                        } else if (roleStr.equalsIgnoreCase("ACИСТЕНТ") || roleStr.equalsIgnoreCase("АСИСТЕНТ")) {
                            normalizedRole = "АСИСТЕНТ";
                        } else {
                            normalizedRole = roleStr.toUpperCase();
                        }

                        try {
                            user.setRole(UserRole.valueOf(normalizedRole));
                            System.out.println("DEBUG: Mapped role: " + normalizedRole);
                        } catch (IllegalArgumentException e) {
                            user.setRole(UserRole.СТУДЕНТ);
                            results.add("Внимание: Корисник " + user.getEmail() +
                                    " - невалидна улога '" + roleStr + "'. Ставена default улога СТУДЕНТ.");
                        }
                    } else {
                        user.setRole(UserRole.СТУДЕНТ);
                    }

                    user.setIndexNumber(getStringValue(record, columnMap, "indexnumber", "индекс"));


                    String createdAtStr = getStringValue(record, columnMap, "createdat", "created_at");
                    if (!createdAtStr.isEmpty()) {
                        try {
                            user.setCreatedAt(LocalDateTime.parse(createdAtStr));
                        } catch (Exception e) {
                            user.setCreatedAt(LocalDateTime.now());
                        }
                    } else {
                        user.setCreatedAt(LocalDateTime.now());
                    }


                    user.setPassword("defaultPassword123");


                    if (user.getId() != null) {
                        Optional<User> existingUser = userService.findById(user.getId());
                        if (existingUser.isPresent()) {

                            User existing = existingUser.get();
                            existing.setFirstName(user.getFirstName());
                            existing.setLastName(user.getLastName());
                            existing.setEmail(user.getEmail());
                            existing.setRole(user.getRole());
                            existing.setIndexNumber(user.getIndexNumber());

                            existing.setPassword(user.getPassword());

                            userService.save(existing);
                            results.add("Ажуриран постоечки корисник: " + user.getFirstName() + " " + user.getLastName());
                        } else {

//
//
//                            .setId(null);
                            userService.save(user);
                        }
                    } else {
                        Optional<User> existingUserByEmail = userService.findByEmail(user.getEmail());
                        if (existingUserByEmail.isPresent()) {
                            results.add("Корисникот со email " + user.getEmail() + " веќе постои. Прескокнат.");
                            continue;
                        } else {
                            userService.save(user);
                        }
                    }

                    successCount++;

                } catch (Exception e) {
                    results.add("Грешка при додавање на корисник " +
                            getStringValue(record, columnMap, "firstname", "име") + ": " + e.getMessage());
                    errorCount++;
                }
            }

            results.add(0, "Успешно додадени/ажурирани: " + successCount + " корисници");
            results.add("Грешки: " + errorCount);

        } catch (Exception e) {
            results.add("Грешка при обработка на CSV датотеката: " + e.getMessage());
        }
        return results;
    }


    private String getStringValue(String[] record, Map<String, Integer> columnMap, String... possibleColumnNames) {
        for (String columnName : possibleColumnNames) {
            Integer index = columnMap.get(columnName.toLowerCase());
            if (index != null && index < record.length) {
                String value = record[index].trim();
                return value.equals("null") || value.isEmpty() ? "" : value;
            }
        }
        return "";
    }

    private Long getLongValue(String[] record, Map<String, Integer> columnMap, String... possibleColumnNames) {
        String value = getStringValue(record, columnMap, possibleColumnNames);
        if (!value.isEmpty()) {
            try {
                return Long.parseLong(value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }


    public List<String> importGradesFromCSV(Long assignmentId, MultipartFile file) throws IOException, CsvException {
        List<String> results = new ArrayList<>();
        Assignment assignment = assignmentService.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment не е пронајден"));

        try (CSVReader csvReader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<String[]> records = csvReader.readAll();

            if (records.isEmpty()) {
                results.add("CSV датотеката е празна");
                return results;
            }

            boolean isFirstRow = true;
            int successCount = 0;
            int errorCount = 0;

            for (String[] record : records) {
                if (isFirstRow) {
                    isFirstRow = false;
                    continue;
                }

                if (record.length < 3) {
                    results.add("Ред со недоволно колони: " + String.join(",", record));
                    errorCount++;
                    continue;
                }

                try {
                    String studentEmail = record[0].trim();
                    Integer grade = Integer.parseInt(record[1].trim());
                    String comments = record.length > 2 ? record[2].trim() : "";

                    var student = userService.findByEmail(studentEmail);
                    if (student.isEmpty()) {
                        results.add("Студентот не е пронајден: " + studentEmail);
                        errorCount++;
                        continue;
                    }

                    var submission = submissionService.findByStudentAndAssignment(student.get().getId(), assignmentId);
                    if (submission.isPresent()) {
                        submissionService.gradeSubmission(submission.get().getId(), grade, comments);
                        successCount++;
                    } else {
                        results.add("Не е пронајдено поднесување за студентот: " + studentEmail);
                        errorCount++;
                    }

                } catch (NumberFormatException e) {
                    results.add("Невалидна оценка во ред: " + String.join(",", record));
                    errorCount++;
                } catch (Exception e) {
                    results.add("Грешка при обработка на ред: " + String.join(",", record) + " - " + e.getMessage());
                    errorCount++;
                }
            }
            results.add("Успешно ажурирани: " + successCount + " оценки");
            results.add("Грешки: " + errorCount);
        }
        return results;
    }
}
