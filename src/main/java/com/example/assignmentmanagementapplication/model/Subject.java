package com.example.assignmentmanagementapplication.model;

import com.example.assignmentmanagementapplication.dto.SubjectDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Код на предмет е задолжителен")
    @Column(unique = true)
    private String code;

    @NotBlank(message = "Име на предмет е задолжително")
    private String name;

    @NotBlank(message = "Семестар е задолжителен")
    private String semester;

    @NotNull(message = "Година е задолжителна")
    private Integer year;

    private String professor;
    @ManyToMany
    @JoinTable(
            name = "subject_assistants",
            joinColumns = @JoinColumn(name = "subject_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> assistants = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Assignment> assignments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }


    public Subject() {}

//    public Subject(String code, String name, String semester, Integer year, String professor, String assistant) {
//        this.code = code;
//        this.name = name;
//        this.semester = semester;
//        this.year = year;
//        this.professor = professor;
//        this.assistant = assistant;
//    }
@ManyToMany
@JoinTable(
        name = "subject_students",
        joinColumns = @JoinColumn(name = "subject_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
)
private List<User> students = new ArrayList<>();

    public List<User> getStudents() {
        return students;
    }

    public void setStudents(List<User> students) {
        this.students = students;
    }

    public Subject(String code, String name, String semester, Integer year, String professor, List<User> assistants, LocalDateTime createdAt, List<Assignment> assignments) {
        this.code = code;
        this.name = name;
        this.semester = semester;
        this.year = year;
        this.professor = professor;
        this.assistants = assistants;
        this.createdAt = createdAt;
        this.assignments = assignments;
    }

    public List<User> getAssistants() {
        return assistants;
    }

    public void setAssistants(List<User> assistants) {
        this.assistants = assistants;
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

    public List<Assignment> getAssignments() { return assignments; }
    public void setAssignments(List<Assignment> assignments) { this.assignments = assignments; }
}