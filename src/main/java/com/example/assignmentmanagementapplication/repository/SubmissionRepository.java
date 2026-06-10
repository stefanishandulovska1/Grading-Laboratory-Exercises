package com.example.assignmentmanagementapplication.repository;

import com.example.assignmentmanagementapplication.model.Assignment;
import com.example.assignmentmanagementapplication.model.Submission;
import com.example.assignmentmanagementapplication.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByStudentId(Long studentId);
    List<Submission> findByAssignmentId(Long assignmentId);

    Optional<Submission> findByStudentAndAssignment(User student, Assignment assignment);

    @Query("SELECT COUNT(s) FROM Submission s WHERE s.grade IS NOT NULL")
    long countGradedSubmissions();

    @Query("SELECT COUNT(s) FROM Submission s WHERE s.grade IS NULL")
    long countPendingSubmissions();

    @Query("SELECT AVG(s.grade) FROM Submission s WHERE s.grade IS NOT NULL")
    Double getOverallAverageGrade();

    @Query("SELECT s FROM Submission s WHERE s.grade IS NOT NULL ORDER BY s.gradedAt DESC")
    List<Submission> findGradedSubmissions();

    @Query("SELECT s FROM Submission s WHERE s.grade IS NULL ORDER BY s.submittedAt ASC")
    List<Submission> findPendingSubmissions();
}