package com.example.assignmentmanagementapplication.dto;

import com.example.assignmentmanagementapplication.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class UserDTO {
    private Long id;

    @NotBlank(message = "Име е задолжително")
    private String firstName;

    @NotBlank(message = "Презиме е задолжително")
    private String lastName;

    @Email(message = "Невалиден email формат")
    @NotBlank(message = "Email е задолжителен")
    private String email;

    private UserRole role;
    private String indexNumber;
    private LocalDateTime createdAt;
    private String fullName;


    public UserDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public String getIndexNumber() { return indexNumber; }
    public void setIndexNumber(String indexNumber) { this.indexNumber = indexNumber; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}
