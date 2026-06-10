package com.example.assignmentmanagementapplication.web;

import com.example.assignmentmanagementapplication.dto.RegisterRequestDTO;
import com.example.assignmentmanagementapplication.dto.UserAuthRequestDTO;
import com.example.assignmentmanagementapplication.dto.UserDTO;
import com.example.assignmentmanagementapplication.model.User;
import com.example.assignmentmanagementapplication.model.UserRole;
import com.example.assignmentmanagementapplication.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<User> users = userService.findAll();
        List<UserDTO> userDTOs = users != null
                ? users.stream().map(this::convertToDTO).collect(Collectors.toList())
                : new ArrayList<>();
        return ResponseEntity.ok(userDTOs);
    }


    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(convertToDTO(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        return userService.findByEmail(email)
                .map(user -> ResponseEntity.ok(convertToDTO(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody UserDTO userDTO) {
        try {
            User user = convertToEntity(userDTO);
            User savedUser = userService.save(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedUser));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @Valid @RequestBody UserDTO userDTO) {
        try {
            User userDetails = convertToEntity(userDTO);
            User updatedUser = userService.update(id, userDetails);
            return ResponseEntity.ok(convertToDTO(updatedUser));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam String term) {
        List<User> users = userService.search(term);
        List<UserDTO> userDTOs = users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable UserRole role) {
        List<User> users = userService.findByRole(role);
        List<UserDTO> userDTOs = users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<UserDTO>> getUsersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "lastName") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<User> users = userService.findPaginated(pageable);
        Page<UserDTO> userDTOs = users.map(this::convertToDTO);
        return ResponseEntity.ok(userDTOs);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUsersCount() {
        return ResponseEntity.ok(userService.count());
    }

    @GetMapping("/count/role/{role}")
    public ResponseEntity<Long> getUsersCountByRole(@PathVariable UserRole role) {
        return ResponseEntity.ok(userService.countByRole(role));
    }
    @GetMapping("/subject/{subjectId}/students")
    public ResponseEntity<List<UserDTO>> getStudentsBySubject(@PathVariable Long subjectId) {
        List<User> students = userService.findStudentsBySubjectId(subjectId);
        List<UserDTO> dtos = students.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }



    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setIndexNumber(user.getIndexNumber());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setFullName(user.getFullName());
        return dto;
    }

    private User convertToEntity(UserDTO dto) {
        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());
        user.setIndexNumber(dto.getIndexNumber());
        return user;
    }
    @GetMapping("/users/staff")
    public ResponseEntity<List<UserDTO>> getStaff() {
        List<User> staff = userService.findByRoleIn(List.of("НАСТАВНИК", "АСИСТЕНТ"));
        List<UserDTO> dtos = staff.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody RegisterRequestDTO req) {
        User user = new User();
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        user.setPassword(req.getPassword());
        user.setRole(UserRole.valueOf(req.getRole()));
        user.setIndexNumber(req.getIndexNumber());
        User saved = userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(saved));
    }

    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody UserAuthRequestDTO req) {
        User user = userService.authenticate(req.getEmail(), req.getPassword());
        return ResponseEntity.ok(convertToDTO(user));
    }


}