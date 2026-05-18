package com.placement.backend.controller;

import com.placement.backend.entity.Certification;
import com.placement.backend.entity.DriveStatus;
import com.placement.backend.entity.Student;
import com.placement.backend.repository.CertificationRepository;
import com.placement.backend.repository.PlacementDriveRepository;
import com.placement.backend.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StatsController {
    private final StudentRepository studentRepository;
    private final CertificationRepository certificationRepository;
    private final PlacementDriveRepository placementDriveRepository;

    public StatsController(StudentRepository studentRepository, CertificationRepository certificationRepository, PlacementDriveRepository placementDriveRepository) {
        this.studentRepository = studentRepository;
        this.certificationRepository = certificationRepository;
        this.placementDriveRepository = placementDriveRepository;
    }

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentStats>> getDepartmentStats() {
        List<Student> students = studentRepository.findAll();
        List<Certification> certifications = certificationRepository.findAll();

        List<String> branches = Arrays.asList("CS", "AIML", "EC", "MECH");

        Map<String, Long> totalByDept = students.stream()
                .collect(Collectors.groupingBy(s -> normalizeBranch(s.getDepartment(), branches), Collectors.counting()));

        Map<String, Long> placedByDept = students.stream()
                .filter(s -> s.getPlacementStatus() != null && s.getPlacementStatus().name().equals("PLACED"))
                .collect(Collectors.groupingBy(s -> normalizeBranch(s.getDepartment(), branches), Collectors.counting()));

        Map<String, Long> certByDept = certifications.stream()
                .map(Certification::getStudent)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(s -> normalizeBranch(s.getDepartment(), branches), Collectors.counting()));

        List<DepartmentStats> stats = branches.stream()
                .map(branch -> buildStats(branch, totalByDept, placedByDept, certByDept))
                .collect(Collectors.toList());

        stats.add(buildStats("OTHER", totalByDept, placedByDept, certByDept));
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryStats> getSummaryStats() {
        List<Student> students = studentRepository.findAll();

        long totalStudents = students.size();
        long placedStudents = students.stream()
                .filter(s -> s.getPlacementStatus() != null && s.getPlacementStatus().name().equals("PLACED"))
                .count();
        long activeDrives = placementDriveRepository.findAll().stream()
                .filter(d -> d.getStatus() == DriveStatus.UPCOMING || d.getStatus() == DriveStatus.ONGOING)
                .count();
        double topPackage = students.stream()
                .map(Student::getSalaryPackage)
                .filter(Objects::nonNull)
                .max(Double::compareTo)
                .orElse(0.0);

        return ResponseEntity.ok(new SummaryStats(totalStudents, placedStudents, activeDrives, Math.round(topPackage * 100.0) / 100.0));
    }

    private DepartmentStats buildStats(String branch, Map<String, Long> totalByDept, Map<String, Long> placedByDept, Map<String, Long> certByDept) {
        long total = totalByDept.getOrDefault(branch, 0L);
        long placed = placedByDept.getOrDefault(branch, 0L);
        long certCount = certByDept.getOrDefault(branch, 0L);
        double percentage = total > 0 ? (placed * 100.0 / total) : 0.0;
        return new DepartmentStats(branch, total, placed, certCount, Math.round(percentage * 100.0) / 100.0);
    }

    private String normalizeBranch(String department, List<String> branches) {
        if (department == null) {
            return "OTHER";
        }
        String normalized = department.trim().toUpperCase();
        return branches.contains(normalized) ? normalized : "OTHER";
    }

    public static class DepartmentStats {
        private String department;
        private long totalStudents;
        private long placedStudents;
        private long certificationCount;
        private double placementPercentage;

        public DepartmentStats(String department, long totalStudents, long placedStudents, long certificationCount, double placementPercentage) {
            this.department = department;
            this.totalStudents = totalStudents;
            this.placedStudents = placedStudents;
            this.certificationCount = certificationCount;
            this.placementPercentage = placementPercentage;
        }

        public String getDepartment() {
            return department;
        }

        public long getTotalStudents() {
            return totalStudents;
        }

        public long getPlacedStudents() {
            return placedStudents;
        }

        public long getCertificationCount() {
            return certificationCount;
        }

        public double getPlacementPercentage() {
            return placementPercentage;
        }
    }

    public static class SummaryStats {
        private final long totalStudents;
        private final long placedStudents;
        private final long activeDrives;
        private final double topPackage;

        public SummaryStats(long totalStudents, long placedStudents, long activeDrives, double topPackage) {
            this.totalStudents = totalStudents;
            this.placedStudents = placedStudents;
            this.activeDrives = activeDrives;
            this.topPackage = topPackage;
        }

        public long getTotalStudents() {
            return totalStudents;
        }

        public long getPlacedStudents() {
            return placedStudents;
        }

        public long getActiveDrives() {
            return activeDrives;
        }

        public double getTopPackage() {
            return topPackage;
        }
    }
}
