package com.example.assignmentmanagementapplication.repository;

import com.example.assignmentmanagementapplication.model.User;
import com.example.assignmentmanagementapplication.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByIndexNumber(String indexNumber);



    boolean existsByEmail(String email);

    boolean existsByIndexNumber(String indexNumber);

    List<User> findByRole(UserRole role);

    @Query("SELECT u FROM User u WHERE u.firstName LIKE %:searchTerm% OR u.lastName LIKE %:searchTerm% OR u.email LIKE %:searchTerm% OR u.indexNumber LIKE %:searchTerm%")
    List<User> findBySearchTerm(@Param("searchTerm") String searchTerm);

    long countByRole(UserRole role);

    List<User> findByRoleIn(List<String> roles);


    @Query("SELECT DISTINCT u FROM User u JOIN u.userAssignments ua WHERE ua.assignment.subject.id = :subjectId AND u.role = 'СТУДЕНТ'")
    List<User> findStudentsBySubjectId(@Param("subjectId") Long subjectId);
}