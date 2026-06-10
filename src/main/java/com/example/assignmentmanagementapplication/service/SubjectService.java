package com.example.assignmentmanagementapplication.service;

import com.example.assignmentmanagementapplication.model.Assignment;
import com.example.assignmentmanagementapplication.model.Subject;
import com.example.assignmentmanagementapplication.model.User;
import com.example.assignmentmanagementapplication.model.UserRole;
import com.example.assignmentmanagementapplication.model.UserAssignment;
import com.example.assignmentmanagementapplication.repository.AssignmentRepository;
import com.example.assignmentmanagementapplication.repository.SubjectRepository;
import com.example.assignmentmanagementapplication.repository.UserRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SubjectService {
    private static final Logger logger = LoggerFactory.getLogger(SubjectService.class);

    @Autowired
    private SubjectRepository subjectRepository;
    @Autowired
    private AssignmentRepository assignmentRepository;
    @Autowired
    private UserRepository userRepository;


    public List<Subject> findAll() {
        return subjectRepository.findAll();
    }

    public Optional<Subject> findById(Long id) {
        return subjectRepository.findById(id);
    }

    public Subject save(Subject subject) {

        if (subjectRepository.existsByCode(subject.getCode())) {
            throw new RuntimeException("Предмет со овој код веќе постои: " + subject.getCode());
        }
        return subjectRepository.save(subject);
    }

    public Subject update(Long id, Subject subjectDetails) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Предметот не е пронајден со ID: " + id));

        if (!subject.getCode().equals(subjectDetails.getCode()) &&
                subjectRepository.existsByCode(subjectDetails.getCode())) {
            throw new RuntimeException("Предмет со овој код веќе постои: " + subjectDetails.getCode());
        }

        subject.setCode(subjectDetails.getCode());
        subject.setName(subjectDetails.getName());
        subject.setSemester(subjectDetails.getSemester());
        subject.setYear(subjectDetails.getYear());
        subject.setAssistants(subjectDetails.getAssistants());
        subject.setProfessor(subjectDetails.getProfessor());

        return subjectRepository.save(subject);
    }

    public void delete(Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new RuntimeException("Предметот не е пронајден со ID: " + id);
        }
        subjectRepository.deleteById(id);
    }

    public List<Assignment> findAssignmentsBySubjectId(Long subjectId) {
        return assignmentRepository.findBySubjectId(subjectId);
    }

    public List<Subject> search(String searchTerm) {
        return subjectRepository.findBySearchTerm(searchTerm);
    }

    public List<Subject> findBySemester(String semester) {
        return subjectRepository.findBySemester(semester);
    }

    public Page<Subject> findPaginated(Pageable pageable) {
        return subjectRepository.findAll(pageable);
    }

    public long count() {
        return subjectRepository.count();
    }

    public List<Subject> findByYear(Integer year) {
        return subjectRepository.findByYear(year);
    }
    @Transactional(rollbackFor = Exception.class)
    public List<String> importStudentsToSubject(Long subjectId, MultipartFile file) {
        List<String> results = new ArrayList<>();

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found with ID: " + subjectId));

        try (CSVReader csvReader = new CSVReader(new InputStreamReader(file.getInputStream(), Charset.forName("windows-1251")))) {
            List<String[]> records = csvReader.readAll();

            if (records.isEmpty()) {
                results.add("CSV is empty");
                return results;
            }

            for (int i = 1; i < records.size(); i++) {
                String[] record = records.get(i);
                try {
                    String firstName = record.length > 0 ? record[0].trim() : "";
                    String lastName  = record.length > 1 ? record[1].trim() : "";
                    String email     = record.length > 2 ? record[2].trim() : "";
                    String role      = record.length > 3 ? record[3].trim() : "";
                    String indexNumber = record.length > 4 ? record[4].trim() : "";

                    if (email.isEmpty()) {
                        results.add("Row " + (i + 1) + " missing email, skipped.");
                        continue;
                    }
                    if (!email.matches("^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$")) {
                        results.add("Row " + (i + 1) + " has invalid email format: " + email + ", skipped.");
                        continue;
                    }

                    Optional<User> userOpt = userRepository.findByEmail(email);
                    User user;
                    if (userOpt.isPresent()) {
                        user = userOpt.get();
                        user.setFirstName(firstName);
                        user.setLastName(lastName);
                        user.setIndexNumber(indexNumber);
                        userRepository.save(user);
                        results.add("Updated existing student: " + email);
                    } else {
                        user = new User();
                        user.setEmail(email);
                        user.setFirstName(firstName);
                        user.setLastName(lastName);
                        user.setRole(UserRole.СТУДЕНТ);
                        user.setIndexNumber(indexNumber);
                        user.setPassword("defaultPassword");
                        user = userRepository.save(user);
                        if (user.getId() == null) {
                            results.add("Row " + (i + 1) + ": Failed to save user " + email);
                            continue;
                        }
                        results.add("Imported student: " + email);
                    }

                    if (!subject.getStudents().contains(user)) {
                        subject.getStudents().add(user);
                    }

                } catch (Exception ex) {
                    logger.error("Error processing row " + (i + 1), ex);
                    results.add("Error on row " + (i + 1) + ": " + ex.getMessage());
                }
            }
            subjectRepository.save(subject);

        } catch (Exception e) {
            logger.error("Failed to import CSV", e);
            results.add("Грешка при увоз на студенти: " + e.getMessage());
        }

        return results;
    }








    public Double getAverageGradeForSubject(Long subjectId) {
        return assignmentRepository.getAverageGradeForSubject(subjectId);
    }

    public long countAssignmentsBySubject(Long subjectId) {
        return assignmentRepository.countBySubjectId(subjectId);
    }
}