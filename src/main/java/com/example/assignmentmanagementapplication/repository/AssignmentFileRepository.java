package com.example.assignmentmanagementapplication.repository;

import com.example.assignmentmanagementapplication.model.AssignmentFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface AssignmentFileRepository extends JpaRepository<AssignmentFile, Long> {

    List<AssignmentFile> findByAssignmentId(Long assignmentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM AssignmentFile af WHERE af.assignment.id = :assignmentId")
    void deleteByAssignmentId(Long assignmentId);
}