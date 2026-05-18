package com.placement.backend.repository;
import com.placement.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByDepartment(String department);
    List<Student> findByPlacementStatus(com.placement.backend.entity.PlacementStatus status);
    boolean existsByRegisterNumber(String registerNumber);
}
