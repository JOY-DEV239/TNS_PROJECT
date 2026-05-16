package com.placement.backend.controller;

import com.placement.backend.entity.Company;
import com.placement.backend.entity.Student;
import com.placement.backend.repository.CompanyRepository;
import com.placement.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @PostMapping
    public Student addStudent(@RequestBody Student student) {
        student.setSelectedCompany(resolveCompany(student.getSelectedCompany()));
        return studentRepository.save(student);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        return studentRepository.findById(id).map(student -> {
            student.setFullName(studentDetails.getFullName());
            student.setRegisterNumber(studentDetails.getRegisterNumber());
            student.setDepartment(studentDetails.getDepartment());
            student.setCgpa(studentDetails.getCgpa());
            student.setTechnicalSkills(studentDetails.getTechnicalSkills());
            student.setResumeUrl(studentDetails.getResumeUrl());
            student.setPlacementStatus(studentDetails.getPlacementStatus());
            student.setSelectedCompany(resolveCompany(studentDetails.getSelectedCompany()));
            student.setSalaryPackage(studentDetails.getSalaryPackage());
            student.setInterviewsAttended(studentDetails.getInterviewsAttended());
            return ResponseEntity.ok(studentRepository.save(student));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        return studentRepository.findById(id).map(student -> {
            studentRepository.delete(student);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    private Company resolveCompany(Company company) {
        if (company == null) {
            return null;
        }
        if (company.getId() != null) {
            return companyRepository.findById(company.getId()).orElseGet(() -> companyRepository.save(company));
        }
        if (company.getName() == null || company.getName().trim().isEmpty()) {
            return null;
        }
        return companyRepository.findByName(company.getName())
                .orElseGet(() -> companyRepository.save(company));
    }
}
