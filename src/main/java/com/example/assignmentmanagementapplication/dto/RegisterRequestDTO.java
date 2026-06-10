package com.example.assignmentmanagementapplication.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterRequestDTO {
    @NotBlank(message = "Име е задолжително")
    private String firstName;

    @NotBlank(message = "Презиме е задолжително")
    private String lastName;

    @Email(message = "Невалиден email формат")
    @NotBlank(message = "Email е задолжителен")
    private String email;

    @NotBlank(message = "Лозинка е задолжителна")
    private String password;

    @NotBlank(message = "Улога е задолжителна")
    private String role; // "СТУДЕНТ", "НАСТАВНИК", "АСИСТЕНТ"

    private String indexNumber;


    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getIndexNumber() { return indexNumber; }
    public void setIndexNumber(String indexNumber) { this.indexNumber = indexNumber; }
}
