package com.example.assignmentmanagementapplication.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UserAuthRequestDTO {
    @Email(message = "Невалиден email формат")
    @NotBlank(message = "Email е задолжителен")
    private String email;

    @NotBlank(message = "Лозинка е задолжителна")
    private String password;


    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
