package com.example.assignmentmanagementapplication.web;

import com.example.assignmentmanagementapplication.service.CSVService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/csv")
@CrossOrigin(origins = "http://localhost:3000")
public class CSVController {

    @Autowired
    private CSVService csvService;

    @GetMapping("/export/users")
    public ResponseEntity<ByteArrayResource> exportUsers() {
        try {
            byte[] csvData = csvService.exportUsersToCSV();

            String filename = "users_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .contentLength(csvData.length)
                    .body(new ByteArrayResource(csvData));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/assignment/{assignmentId}/results")
    public ResponseEntity<ByteArrayResource> exportAssignmentResults(@PathVariable Long assignmentId) {
        try {

            if (assignmentId == null || assignmentId <= 0) {
                return ResponseEntity.badRequest().build();
            }

            byte[] csvData = csvService.exportAssignmentResultsToCSV(assignmentId);

            String filename = "assignment_results_" + assignmentId + "_" +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                    .contentLength(csvData.length)
                    .body(new ByteArrayResource(csvData));

        } catch (IllegalArgumentException e) {
            System.err.println("Invalid assignment ID: " + assignmentId);
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            System.err.println("Assignment not found: " + assignmentId);
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            System.err.println("IO Error during CSV export: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        } catch (Exception e) {
            System.err.println("Unexpected error during CSV export: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/subject/{subjectId}/results")
    public ResponseEntity<ByteArrayResource> exportSubjectResults(@PathVariable Long subjectId) {
        try {
            byte[] csvData = csvService.exportSubjectResultsToCSV(subjectId);

            String filename = "subject_results_" + subjectId + "_" +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .contentLength(csvData.length)
                    .body(new ByteArrayResource(csvData));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/import/students")
    public ResponseEntity<List<String>> importStudents(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(List.of("Датотеката е празна"));
            }
            List<String> results = csvService.importStudentsFromCSV(file);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(List.of("Грешка при увозот: " + e.getMessage()));
        }
    }

    @PostMapping("/import/assignment/{assignmentId}/grades")
    public ResponseEntity<List<String>> importGrades(@PathVariable Long assignmentId,
                                                     @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(List.of("Датотеката е празна"));
            }
            List<String> results = csvService.importGradesFromCSV(assignmentId, file);
            return ResponseEntity.ok(results);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(List.of("Грешка при увозот на оценки: " + e.getMessage()));
        }
    }

    @PostMapping("/import/users")
    public ResponseEntity<List<String>> importUsers(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(List.of("Датотеката е празна"));
            }
            List<String> results = csvService.importUsersFromCSV(file);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(List.of("Грешка при увоз на корисници: " + e.getMessage()));
        }
    }

    @GetMapping("/template/grades")
    public ResponseEntity<ByteArrayResource> downloadGradesTemplate() {
        String csvTemplate = "Email,Оценка,Коментари\n" +
                "marija@example.com,85,Одлично решение\n" +
                "stefan@example.com,72,Добро но може подобро\n";

        byte[] csvData = csvTemplate.getBytes();
        String filename = "grades_template.csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(csvData.length)
                .body(new ByteArrayResource(csvData));
    }
}
