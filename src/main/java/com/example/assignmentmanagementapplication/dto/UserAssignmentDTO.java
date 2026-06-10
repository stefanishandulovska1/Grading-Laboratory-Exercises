package com.example.assignmentmanagementapplication.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;

public class UserAssignmentDTO {
    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private String userIndexNumber;

    private Long assignmentId;
    private String assignmentTitle;
    private Integer assignmentPoints;

    @Min(value = 0, message = "Минимална оценка е 0")
    @Max(value = 100, message = "Максимална оценка е 100")
    private Integer grade;

    private String comments;
    private LocalDateTime submittedAt;
    private LocalDateTime gradedAt;
    private boolean isGraded;


    public UserAssignmentDTO() {}


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserIndexNumber() { return userIndexNumber; }
    public void setUserIndexNumber(String userIndexNumber) { this.userIndexNumber = userIndexNumber; }

    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

    public String getAssignmentTitle() { return assignmentTitle; }
    public void setAssignmentTitle(String assignmentTitle) { this.assignmentTitle = assignmentTitle; }

    public Integer getAssignmentPoints() { return assignmentPoints; }
    public void setAssignmentPoints(Integer assignmentPoints) { this.assignmentPoints = assignmentPoints; }

    public Integer getGrade() { return grade; }
    public void setGrade(Integer grade) { this.grade = grade; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getGradedAt() { return gradedAt; }
    public void setGradedAt(LocalDateTime gradedAt) { this.gradedAt = gradedAt; }

    public boolean isGraded() { return isGraded; }
    public void setGraded(boolean graded) { isGraded = graded; }
}
