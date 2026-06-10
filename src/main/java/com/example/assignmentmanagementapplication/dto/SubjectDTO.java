package com.example.assignmentmanagementapplication.dto;

import com.example.assignmentmanagementapplication.model.Subject;
import com.example.assignmentmanagementapplication.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public class SubjectDTO {
    private Long id;

    @NotBlank(message = "Код на предмет е задолжителен")
    private String code;

    @NotBlank(message = "Име на предмет е задолжително")
    private String name;

    @NotBlank(message = "Семестар е задолжителен")
    private String semester;

    @NotNull(message = "Година е задолжителна")
    private Integer year;

    private String professor;
    private List<Long> assistantIds;
    //    private String assistant;
    private LocalDateTime createdAt;
    private List<UserDTO> students;

    public List<UserDTO> getStudents() {
        return students;
    }

    public void setStudents(List<UserDTO> students) {
        this.students = students;
    }

    private int assignmentCount;
    private List<UserDTO> assistants;

    public List<UserDTO> getAssistants() {
        return assistants;
    }

    public void setAssistants(List<UserDTO> assistants) {
        this.assistants = assistants;
    }

    public SubjectDTO() {}


    public SubjectDTO(String code, String name, String semester, Integer year, String professor, List<Long> assistantIds, LocalDateTime createdAt, int assignmentCount) {
        this.code = code;
        this.name = name;
        this.semester = semester;
        this.year = year;
        this.professor = professor;
        this.assistantIds = assistantIds;
        this.createdAt = createdAt;
        this.assignmentCount = assignmentCount;
    }

    public List<Long> getAssistantIds() {
        return assistantIds;
    }

    public void setAssistantIds(List<Long> assistantIds) {
        this.assistantIds = assistantIds;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getProfessor() { return professor; }
    public void setProfessor(String professor) { this.professor = professor; }

//    public String getAssistant() { return assistant; }
//    public void setAssistant(String assistant) { this.assistant = assistant; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public int getAssignmentCount() { return assignmentCount; }
    public void setAssignmentCount(int assignmentCount) { this.assignmentCount = assignmentCount; }
}