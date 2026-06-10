package com.example.assignmentmanagementapplication.web;

import com.example.assignmentmanagementapplication.dto.SubjectDTO;
import com.example.assignmentmanagementapplication.dto.UserDTO;
import com.example.assignmentmanagementapplication.model.Subject;
import com.example.assignmentmanagementapplication.model.User;
import com.example.assignmentmanagementapplication.service.SubjectService;
import com.example.assignmentmanagementapplication.service.UserService;
import com.opencsv.exceptions.CsvException;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/subjects")
@CrossOrigin(origins = "http://localhost:3000")
public class SubjectController {
    private static final Logger logger = LoggerFactory.getLogger(SubjectController.class);
    @Autowired
    private SubjectService subjectService;
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<SubjectDTO>> getAllSubjects() {
        List<Subject> subjects = subjectService.findAll();
        List<SubjectDTO> subjectDTOs = subjects != null
                ? subjects.stream().map(this::convertToDTO).collect(Collectors.toList())
                : new ArrayList<>();
        return ResponseEntity.ok(subjectDTOs);
    }


    @GetMapping("/{id}")
    public ResponseEntity<SubjectDTO> getSubjectById(@PathVariable Long id) {
        return subjectService.findById(id)
                .map(subject -> ResponseEntity.ok(convertToDTO(subject)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SubjectDTO> createSubject(@Valid @RequestBody SubjectDTO subjectDTO) {
        try {
            Subject subject = convertToEntity(subjectDTO);
            Subject savedSubject = subjectService.save(subject);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedSubject));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubjectDTO> updateSubject(@PathVariable Long id, @Valid @RequestBody SubjectDTO subjectDTO) {
        try {
            Subject subjectDetails = convertToEntity(subjectDTO);
            subjectDetails.setId(id);
            Subject updatedSubject = subjectService.update(id, subjectDetails);
            return ResponseEntity.ok(convertToDTO(updatedSubject));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        try {
            subjectService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/year/{year}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsByYear(@PathVariable Integer year) {
        List<Subject> subjects = subjectService.findByYear(year);
        List<SubjectDTO> subjectDTOs = subjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(subjectDTOs);
    }

    @GetMapping("/semester/{semester}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsBySemester(@PathVariable String semester) {
        List<Subject> subjects = subjectService.findBySemester(semester);
        List<SubjectDTO> subjectDTOs = subjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(subjectDTOs);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<SubjectDTO>> getSubjectsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<Subject> subjects = subjectService.findPaginated(pageable);
        Page<SubjectDTO> subjectDTOs = subjects.map(this::convertToDTO);
        return ResponseEntity.ok(subjectDTOs);
    }

    @GetMapping("/search")
    public ResponseEntity<List<SubjectDTO>> searchSubjects(@RequestParam String term) {
        List<Subject> subjects = subjectService.search(term);
        List<SubjectDTO> subjectDTOs = subjects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(subjectDTOs);
    }

    @PostMapping("/{subjectId}/import-students")
    public ResponseEntity<List<String>> importStudentsToSubject(
            @PathVariable Long subjectId,
            @RequestParam("file") MultipartFile file) {
        try {
            List<String> results = subjectService.importStudentsToSubject(subjectId, file);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Import students failed", e);
            return ResponseEntity.badRequest().body(List.of("Error importing students: " + e.getMessage()));
        }
    }




    @GetMapping("/count")
    public ResponseEntity<Long> getSubjectsCount() {
        return ResponseEntity.ok(subjectService.count());
    }



    private SubjectDTO convertToDTO(Subject subject) {
        SubjectDTO dto = new SubjectDTO();
        dto.setId(subject.getId());
        dto.setCode(subject.getCode());
        dto.setName(subject.getName());
        dto.setSemester(subject.getSemester());
        dto.setYear(subject.getYear());
        dto.setProfessor(subject.getProfessor());
        dto.setStudents(convertUsersToUserDTOs(subject.getStudents()));


        if (subject.getAssistants() != null) {
            List<Long> assistantIds = subject.getAssistants().stream()
                    .map(User::getId)
                    .collect(Collectors.toList());
            dto.setAssistantIds(assistantIds);

            List<UserDTO> assistantDTOs = subject.getAssistants().stream()
                    .map(u -> {
                        UserDTO userDTO = new UserDTO();
                        userDTO.setId(u.getId());
                        userDTO.setFirstName(u.getFirstName());
                        userDTO.setLastName(u.getLastName());
                        userDTO.setEmail(u.getEmail());
                        return userDTO;
                    })
                    .collect(Collectors.toList());
            dto.setAssistants(assistantDTOs);
        } else {
            dto.setAssistantIds(Collections.emptyList());
            dto.setAssistants(Collections.emptyList());
        }

        dto.setAssignmentCount(subject.getAssignments() != null ? subject.getAssignments().size() : 0);
        return dto;
    }

    private Subject convertToEntity(SubjectDTO dto) {
        Subject subject = new Subject();
        subject.setId(dto.getId());
        subject.setCode(dto.getCode());
        subject.setName(dto.getName());
        subject.setSemester(dto.getSemester());
        subject.setYear(dto.getYear());
        subject.setProfessor(dto.getProfessor());

        if (dto.getAssistantIds() != null && !dto.getAssistantIds().isEmpty()) {
            List<User> assistants = userService.findAllById(dto.getAssistantIds());
            subject.setAssistants(assistants);
        } else {
            subject.setAssistants(Collections.emptyList());
        }

        return subject;
    }
    private List<UserDTO> convertUsersToUserDTOs(List<User> users) {
        List<UserDTO> dtos = new ArrayList<>();
        for (User user : users) {
            UserDTO dto = new UserDTO();
            dto.setId(user.getId());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setEmail(user.getEmail());
            dto.setRole(user.getRole());
            dto.setIndexNumber(user.getIndexNumber());

            dtos.add(dto);
        }
        return dtos;
    }


}
