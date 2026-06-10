package com.example.assignmentmanagementapplication.dto;


import com.example.assignmentmanagementapplication.model.Submission;

import java.time.LocalDateTime;

public class SubmissionDTO {
    private Long id;
    private Integer grade;
    private String comments;
    private LocalDateTime submittedAt;
    private LocalDateTime gradedAt;
    private String submissionFiles;


    private Long studentId;
    private String studentFirstName;
    private String studentLastName;
    private String studentIndexNumber;


    private Long assignmentId;
    private String assignmentTitle;
    private Integer assignmentPoints;


    public SubmissionDTO() {}

    public SubmissionDTO(Submission submission) {
        this.id = submission.getId();
        this.grade = submission.getGrade();
        this.comments = submission.getComments();
        this.submittedAt = submission.getSubmittedAt();
        this.gradedAt = submission.getGradedAt();
        this.submissionFiles = submission.getSubmissionFiles();


        if (submission.getStudent() != null) {
            this.studentId = submission.getStudent().getId();
            this.studentFirstName = submission.getStudent().getFirstName();
            this.studentLastName = submission.getStudent().getLastName();
            this.studentIndexNumber = submission.getStudent().getIndexNumber();
        }


        if (submission.getAssignment() != null) {
            this.assignmentId = submission.getAssignment().getId();
            this.assignmentTitle = submission.getAssignment().getTitle();
            this.assignmentPoints = submission.getAssignment().getMaxPoints();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getGrade() {
        return grade;
    }

    public void setGrade(Integer grade) {
        this.grade = grade;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getGradedAt() {
        return gradedAt;
    }

    public void setGradedAt(LocalDateTime gradedAt) {
        this.gradedAt = gradedAt;
    }

    public String getSubmissionFiles() {
        return submissionFiles;
    }

    public void setSubmissionFiles(String submissionFiles) {
        this.submissionFiles = submissionFiles;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentFirstName() {
        return studentFirstName;
    }

    public void setStudentFirstName(String studentFirstName) {
        this.studentFirstName = studentFirstName;
    }

    public String getStudentLastName() {
        return studentLastName;
    }

    public void setStudentLastName(String studentLastName) {
        this.studentLastName = studentLastName;
    }

    public String getStudentIndexNumber() {
        return studentIndexNumber;
    }

    public void setStudentIndexNumber(String studentIndexNumber) {
        this.studentIndexNumber = studentIndexNumber;
    }

    public Long getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(Long assignmentId) {
        this.assignmentId = assignmentId;
    }

    public String getAssignmentTitle() {
        return assignmentTitle;
    }

    public void setAssignmentTitle(String assignmentTitle) {
        this.assignmentTitle = assignmentTitle;
    }

    public Integer getAssignmentPoints() {
        return assignmentPoints;
    }

    public void setAssignmentPoints(Integer assignmentPoints) {
        this.assignmentPoints = assignmentPoints;
    }
}