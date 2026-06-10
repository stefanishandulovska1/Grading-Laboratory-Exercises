package com.example.assignmentmanagementapplication.service;
import com.example.assignmentmanagementapplication.model.User;
import com.example.assignmentmanagementapplication.model.UserRole;
import com.example.assignmentmanagementapplication.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    public List<User> findByRoleIn(List<String> roles) {
        return userRepository.findByRoleIn(roles);
    }


    public User save(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Корисник со оваа email адреса веќе постои: " + user.getEmail());
        }

        if (user.getRole() == UserRole.СТУДЕНТ && user.getIndexNumber() != null) {
            if (userRepository.existsByIndexNumber(user.getIndexNumber())) {
                throw new RuntimeException("Студент со овој индекс веќе постои: " + user.getIndexNumber());
            }
        }

        return userRepository.save(user);
    }
    public List<User> findAllById(List<Long> ids) {
        return userRepository.findAllById(ids);
    }

    public User update(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Корисникот не е пронајден со ID: " + id));


        if (!user.getEmail().equals(userDetails.getEmail()) &&
                userRepository.existsByEmail(userDetails.getEmail())) {
            throw new RuntimeException("Корисник со оваа email адреса веќе постои: " + userDetails.getEmail());
        }


        if (userDetails.getRole() == UserRole.СТУДЕНТ && userDetails.getIndexNumber() != null &&
                !userDetails.getIndexNumber().equals(user.getIndexNumber()) &&
                userRepository.existsByIndexNumber(userDetails.getIndexNumber())) {
            throw new RuntimeException("Студент со овој индекс веќе постои: " + userDetails.getIndexNumber());
        }

        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());
        user.setIndexNumber(userDetails.getIndexNumber());

        return userRepository.save(user);
    }

    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Корисникот не е пронајден со ID: " + id);
        }
        userRepository.deleteById(id);
    }

    public List<User> findByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    public List<User> search(String searchTerm) {
        return userRepository.findBySearchTerm(searchTerm);
    }

    public Page<User> findPaginated(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public long count() {
        return userRepository.count();
    }

    public long countByRole(UserRole role) {
        return userRepository.countByRole(role);
    }
    public List<User> findStudentsBySubjectId(Long subjectId) {
        return userRepository.findStudentsBySubjectId(subjectId);
    }

    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials");
        }
        return user;
    }


}