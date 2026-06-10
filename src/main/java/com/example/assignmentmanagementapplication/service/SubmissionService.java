package com.example.assignmentmanagementapplication.service;

import com.example.assignmentmanagementapplication.model.Assignment;
import com.example.assignmentmanagementapplication.model.Submission;
import com.example.assignmentmanagementapplication.model.User;
import com.example.assignmentmanagementapplication.repository.AssignmentRepository;
import com.example.assignmentmanagementapplication.repository.SubmissionRepository;
import com.example.assignmentmanagementapplication.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    public List<Submission> findAll() {
        return submissionRepository.findAll();
    }

    public Optional<Submission> findById(Long id) {
        return submissionRepository.findById(id);
    }

    public Submission save(Submission submission) {

        if (submission.getStudent() != null && submission.getStudent().getId() != null) {
            User user = userRepository.findById(submission.getStudent().getId())
                    .orElseThrow(() -> new RuntimeException("Корисникот не е пронајден"));
            submission.setStudent(user);
        }

        if (submission.getAssignment() != null && submission.getAssignment().getId() != null) {
            Assignment assignment = assignmentRepository.findById(submission.getAssignment().getId())
                    .orElseThrow(() -> new RuntimeException("Assignment не е пронајден"));
            submission.setAssignment(assignment);
        }

        return submissionRepository.save(submission);
    }

    public Submission update(Long id, Submission submissionDetails) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission не е пронајден со ID: " + id));

        submission.setGrade(submissionDetails.getGrade());
        submission.setComments(submissionDetails.getComments());
        submission.setSubmissionFiles(submissionDetails.getSubmissionFiles());

        return submissionRepository.save(submission);
    }

    public Submission gradeSubmission(Long submissionId, Integer grade, String comments) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission не е пронајден со ID: " + submissionId));

        submission.setGrade(grade);
        submission.setComments(comments);

        return submissionRepository.save(submission);
    }

    public void delete(Long id) {
        if (!submissionRepository.existsById(id)) {
            throw new RuntimeException("Submission не е пронајден со ID: " + id);
        }
        submissionRepository.deleteById(id);
    }

    public List<Submission> findByStudentId(Long studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    public List<Submission> findByAssignmentId(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    public Optional<Submission> findByStudentAndAssignment(Long studentId, Long assignmentId) {
        try {
            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new RuntimeException("Assignment not found with ID: " + assignmentId));

            return submissionRepository.findByStudentAndAssignment(student, assignment);
        } catch (Exception e) {
            System.out.println("Error in findByStudentAndAssignment: " + e.getMessage());
            return Optional.empty();
        }
    }

    public long countGraded() {
        return submissionRepository.countGradedSubmissions();
    }

    public long countPending() {
        return submissionRepository.countPendingSubmissions();
    }

    public Double getOverallAverageGrade() {
        return submissionRepository.getOverallAverageGrade();
    }

    public List<Submission> findGradedSubmissions() {
        return submissionRepository.findGradedSubmissions();
    }

    public List<Submission> findPendingSubmissions() {
        return submissionRepository.findPendingSubmissions();
    }
}