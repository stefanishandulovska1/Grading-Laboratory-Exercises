package com.example.assignmentmanagementapplication.repository;

import com.example.assignmentmanagementapplication.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    Optional<Subject> findByCode(String code);
    boolean existsByCode(String code);

    List<Subject> findBySemester(String semester);
    List<Subject> findByYear(Integer year);

    @Query("SELECT s FROM Subject s WHERE s.name LIKE %:searchTerm% OR s.code LIKE %:searchTerm%")
    List<Subject> findBySearchTerm(@Param("searchTerm") String searchTerm);

    @Query("SELECT COUNT(s) FROM Subject s WHERE s.semester = :semester")
    long countBySemester(@Param("semester") String semester);
}