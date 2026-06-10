package com.example.assignmentmanagementapplication.service;

import com.example.assignmentmanagementapplication.model.Assignment;
import com.example.assignmentmanagementapplication.model.AssignmentFile;
import com.example.assignmentmanagementapplication.repository.AssignmentFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    private AssignmentFileRepository assignmentFileRepository;

    public AssignmentFile storeFile(MultipartFile file, Assignment assignment) {
        try {

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String uniqueFileName = timestamp + "_" + UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            AssignmentFile assignmentFile = new AssignmentFile();
            assignmentFile.setFileName(file.getOriginalFilename());
            assignmentFile.setFilePath(filePath.toString());
            assignmentFile.setFileType(file.getContentType());
            assignmentFile.setFileSize(file.getSize());
            assignmentFile.setAssignment(assignment);

            return assignmentFileRepository.save(assignmentFile);

        } catch (IOException e) {
            throw new RuntimeException("Неуспешно зачувување на датотеката: " + file.getOriginalFilename(), e);
        }
    }

    public List<AssignmentFile> findByAssignmentId(Long assignmentId) {
        return assignmentFileRepository.findByAssignmentId(assignmentId);
    }

    public Optional<AssignmentFile> findById(Long id) {
        return assignmentFileRepository.findById(id);
    }

    public void deleteFile(Long fileId) {
        AssignmentFile file = assignmentFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Датотеката не е пронајдена со ID: " + fileId));

        try {

            Path filePath = Paths.get(file.getFilePath());
            Files.deleteIfExists(filePath);


            assignmentFileRepository.delete(file);

        } catch (IOException e) {
            throw new RuntimeException("Неуспешно бришење на датотеката: " + file.getFileName(), e);
        }
    }

    public void deleteFilesByAssignmentId(Long assignmentId) {
        List<AssignmentFile> files = assignmentFileRepository.findByAssignmentId(assignmentId);

        for (AssignmentFile file : files) {
            try {
                Path filePath = Paths.get(file.getFilePath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {

                System.err.println("Неуспешно бришење на датотека: " + file.getFileName());
            }
        }

        assignmentFileRepository.deleteByAssignmentId(assignmentId);
    }

    public byte[] loadFileAsResource(Long fileId) {
        AssignmentFile file = assignmentFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Датотеката не е пронајдена со ID: " + fileId));

        try {
            Path filePath = Paths.get(file.getFilePath());
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Неуспешно читање на датотеката: " + file.getFileName(), e);
        }
    }
}
