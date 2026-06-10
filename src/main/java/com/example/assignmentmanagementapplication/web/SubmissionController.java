package com.example.assignmentmanagementapplication.web;

import com.example.assignmentmanagementapplication.dto.SubmissionDTO;
import com.example.assignmentmanagementapplication.model.Assignment;
import com.example.assignmentmanagementapplication.model.Submission;
import com.example.assignmentmanagementapplication.model.User;
import com.example.assignmentmanagementapplication.repository.AssignmentRepository;
import com.example.assignmentmanagementapplication.repository.UserRepository;
import com.example.assignmentmanagementapplication.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/submissions")
@CrossOrigin(origins = "http://localhost:3000")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;




    @GetMapping("/{id}")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable Long id) {
        return submissionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Submission> createSubmission(@Valid @RequestBody Submission submission) {
        try {
            Submission saved = submissionService.save(submission);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    @GetMapping("/download/{submissionId}")
    public ResponseEntity<Resource> downloadSubmissionFile(@PathVariable Long submissionId) {
        try {
            Optional<Submission> submissionOpt = submissionService.findById(submissionId);
            if (submissionOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Submission submission = submissionOpt.get();

            if (submission.getSubmissionFiles() == null || submission.getSubmissionFiles().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            ObjectMapper mapper = new ObjectMapper();
            List<String> files = mapper.readValue(submission.getSubmissionFiles(), List.class);
            if (files.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            String filePath = files.get(0);
            Path path = Paths.get(filePath);
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }


            byte[] fileContent = Files.readAllBytes(path);
            boolean isPdf = fileContent.length > 4 &&
                    fileContent[0] == 0x25 && // %
                    fileContent[1] == 0x50 && // P
                    fileContent[2] == 0x44 && // D
                    fileContent[3] == 0x46;   // F

            if (!isPdf) {
                throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "File is not a valid PDF");
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + path.getFileName().toString() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                    .contentLength(resource.contentLength())
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Submission> updateSubmission(@PathVariable Long id, @Valid @RequestBody Submission submissionDetails) {
        try {
            Submission updated = submissionService.update(id, submissionDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/grade")
    public ResponseEntity<Submission> gradeSubmission(
            @PathVariable Long id,
            @RequestParam Integer grade,
            @RequestParam(required = false) String comments) {
        try {
            Submission graded = submissionService.gradeSubmission(id, grade, comments);
            return ResponseEntity.ok(graded);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable Long id) {
        try {
            submissionService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<SubmissionDTO>> getAllSubmissions() {
        List<Submission> submissions = submissionService.findAll();
        List<SubmissionDTO> submissionDTOs = submissions.stream()
                .map(SubmissionDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(submissionDTOs);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByStudent(@PathVariable Long studentId) {
        List<Submission> submissions = submissionService.findByStudentId(studentId);
        List<SubmissionDTO> submissionDTOs = submissions.stream()
                .map(SubmissionDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(submissionDTOs);
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByAssignment(@PathVariable Long assignmentId) {
        List<Submission> submissions = submissionService.findByAssignmentId(assignmentId);
        List<SubmissionDTO> submissionDTOs = submissions.stream()
                .map(SubmissionDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(submissionDTOs);
    }
    @PostMapping("/upload/{assignmentId}/student/{studentId}")
    public ResponseEntity<?> uploadSubmissionFile(
            @PathVariable Long assignmentId,
            @PathVariable Long studentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "comments", required = false) String comments) {

        Optional<Assignment> assignmentOpt = assignmentRepository.findById(assignmentId);
        Optional<User> studentOpt = userRepository.findById(studentId);

        if (assignmentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Assignment not found");
        }

        if (studentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student not found");
        }

        Assignment assignment = assignmentOpt.get();
        User student = studentOpt.get();

        if (assignment.getDueDate() != null && LocalDateTime.now().isAfter(assignment.getDueDate())) {
            return ResponseEntity.badRequest().body("Рокот за поднесување е истечен");
        }

        if (!file.getContentType().equalsIgnoreCase("application/pdf")) {
            return ResponseEntity.badRequest().body("Само PDF датотеки се дозволени");
        }

        try {
            Path uploadDir = Paths.get("uploads/submissions");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            String filename = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"))
                    + "_" + UUID.randomUUID() + "_" + file.getOriginalFilename();

            Path filePath = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            Optional<Submission> existing = submissionService.findByStudentAndAssignment(student.getId(), assignment.getId());

            Submission submission;

            if (existing.isPresent()) {
                submission = existing.get();

                if (submission.getSubmissionFiles() != null) {
                    ObjectMapper mapper = new ObjectMapper();
                    List<String> oldFiles = mapper.readValue(submission.getSubmissionFiles(), List.class);
                    for (String oldFilePath : oldFiles) {
                        try {
                            Path oldPath = Paths.get(oldFilePath);
                            Files.deleteIfExists(oldPath);
                        } catch (IOException e) {

                            System.out.println("Warning: Could not delete old file: " + oldFilePath);
                        }
                    }
                }
            } else {
                submission = new Submission();
                submission.setAssignment(assignment);
                submission.setStudent(student);
                submission.setSubmittedAt(LocalDateTime.now());
            }

            ObjectMapper mapper = new ObjectMapper();
            List<String> filesList;

            if (submission.getSubmissionFiles() != null) {
                filesList = mapper.readValue(submission.getSubmissionFiles(), List.class);
            } else {
                filesList = new ArrayList<>();
            }

            filesList.clear();
            filesList.add(filePath.toString());

            submission.setSubmissionFiles(mapper.writeValueAsString(filesList));
            submission.setComments(comments);
            submissionService.save(submission);

            return ResponseEntity.ok("Поднесувањето е успешно зачувано");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Грешка при зачувување на поднесувањето: " + e.getMessage());
        }
    }
}
