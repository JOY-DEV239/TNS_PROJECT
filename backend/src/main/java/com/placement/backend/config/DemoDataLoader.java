package com.placement.backend.config;

import com.placement.backend.entity.Company;
import com.placement.backend.entity.DriveStatus;
import com.placement.backend.entity.PlacementDrive;
import com.placement.backend.entity.PlacementStatus;
import com.placement.backend.entity.Student;
import com.placement.backend.repository.CompanyRepository;
import com.placement.backend.repository.PlacementDriveRepository;
import com.placement.backend.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DemoDataLoader implements CommandLineRunner {
    private final CompanyRepository companyRepository;
    private final StudentRepository studentRepository;
    private final PlacementDriveRepository placementDriveRepository;

    public DemoDataLoader(CompanyRepository companyRepository, StudentRepository studentRepository, PlacementDriveRepository placementDriveRepository) {
        this.companyRepository = companyRepository;
        this.studentRepository = studentRepository;
        this.placementDriveRepository = placementDriveRepository;
    }

    @Override
    public void run(String... args) {
        seedCompany("TechNova Solutions", "A full-stack software services provider.", 7.5, Arrays.asList("CS", "AIML", "EC"), Arrays.asList("Written Test", "Technical Interview", "HR Interview"));
        seedCompany("Apex Analytics", "Data science and AI consulting firm.", 8.0, Arrays.asList("CS", "AIML"), Arrays.asList("Coding Round", "System Design", "HR Round"));
        seedCompany("CoreCircuits", "Embedded systems and electronics design.", 6.5, Arrays.asList("EC", "MECH"), Arrays.asList("Circuit Design", "Technical Interview", "HR Interview"));
        seedPlacementDataset();
    }

    private void seedCompany(String name, String description, Double minCgpa, java.util.List<String> departments, java.util.List<String> rounds) {
        if (!companyRepository.existsByName(name)) {
            Company company = new Company();
            company.setName(name);
            company.setDescription(description);
            company.setMinimumCgpa(minCgpa);
            company.setEligibleDepartments(departments);
            company.setPackageDetails(12.5);
            company.setRecruitmentRounds(rounds);
            companyRepository.save(company);
        }
    }

    private void seedPlacementDataset() {
        try (InputStream inputStream = getClass().getResourceAsStream("/data/campus_placement.csv")) {
            if (inputStream == null) {
                return;
            }

            int imported = 0;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
                reader.readLine();
                String line;
                while ((line = reader.readLine()) != null) {
                    String[] columns = line.split(",", -1);
                    if (columns.length < 15) {
                        continue;
                    }

                    String registerNumber = "IMP-" + String.format("%04d", parseInt(columns[0], 0));
                    if (studentRepository.existsByRegisterNumber(registerNumber)) {
                        continue;
                    }

                    Student student = new Student();
                    student.setFullName("Imported Student " + columns[0]);
                    student.setRegisterNumber(registerNumber);
                    student.setDepartment(toDepartment(columns[8]));
                    student.setCgpa(toCgpa(columns[7]));
                    student.setTechnicalSkills(toSkills(columns[8], columns[9], columns[11]));
                    student.setResumeUrl("");
                    student.setInterviewsAttended(columns[13].equalsIgnoreCase("Placed") ? 3 : 1);
                    student.setPlacementStatus(columns[13].equalsIgnoreCase("Placed") ? PlacementStatus.PLACED : PlacementStatus.UNPLACED);

                    if (student.getPlacementStatus() == PlacementStatus.PLACED) {
                        Company company = placementCompanyFor(columns[11]);
                        student.setSelectedCompany(company);
                        student.setSalaryPackage(toLpa(columns[14]));
                    }

                    studentRepository.save(student);
                    imported++;
                }
            }

            if (imported > 0) {
                seedDatasetDrives();
                System.out.println("Imported " + imported + " campus placement dataset students into placement_db.");
            }
        } catch (Exception ex) {
            System.err.println("Campus placement dataset import skipped: " + ex.getMessage());
        }
    }

    private Company placementCompanyFor(String specialisation) {
        if ("Mkt&Fin".equalsIgnoreCase(specialisation)) {
            return companyRepository.findByName("FinanceEdge Analytics")
                    .orElseGet(() -> createCompany("FinanceEdge Analytics", "Campus recruiter for finance, analytics, and business technology roles.", 6.0, Arrays.asList("CS", "IT", "MGT"), 5.5, Arrays.asList("Aptitude Test", "Business Case", "HR Interview")));
        }
        return companyRepository.findByName("PeopleFirst HR Tech")
                .orElseGet(() -> createCompany("PeopleFirst HR Tech", "Campus recruiter for HR technology and operations roles.", 6.0, Arrays.asList("CS", "IT", "MGT"), 4.8, Arrays.asList("Aptitude Test", "Group Discussion", "HR Interview")));
    }

    private Company createCompany(String name, String description, Double minCgpa, List<String> departments, Double packageDetails, List<String> rounds) {
        Company company = new Company();
        company.setName(name);
        company.setDescription(description);
        company.setMinimumCgpa(minCgpa);
        company.setEligibleDepartments(departments);
        company.setPackageDetails(packageDetails);
        company.setRecruitmentRounds(rounds);
        return companyRepository.save(company);
    }

    private void seedDatasetDrives() {
        if (placementDriveRepository.count() > 0) {
            return;
        }
        companyRepository.findByName("FinanceEdge Analytics").ifPresent(company -> placementDriveRepository.save(createDrive(company, "Main Seminar Hall", "CGPA 6.0+, aptitude shortlisted", DriveStatus.COMPLETED)));
        companyRepository.findByName("PeopleFirst HR Tech").ifPresent(company -> placementDriveRepository.save(createDrive(company, "Placement Cell Lab", "CGPA 6.0+, communication round shortlisted", DriveStatus.COMPLETED)));
    }

    private PlacementDrive createDrive(Company company, String venue, String criteria, DriveStatus status) {
        PlacementDrive drive = new PlacementDrive();
        drive.setCompany(company);
        drive.setDriveDate(LocalDateTime.now().minusDays(30));
        drive.setVenue(venue);
        drive.setEligibilityCriteria(criteria);
        drive.setInterviewRounds(company.getRecruitmentRounds());
        drive.setStatus(status);
        return drive;
    }

    private String toDepartment(String degreeType) {
        if ("Sci&Tech".equalsIgnoreCase(degreeType)) {
            return "CS";
        }
        if ("Comm&Mgmt".equalsIgnoreCase(degreeType)) {
            return "MGT";
        }
        return "IT";
    }

    private List<String> toSkills(String degreeType, String workExperience, String specialisation) {
        if ("Sci&Tech".equalsIgnoreCase(degreeType)) {
            return "Yes".equalsIgnoreCase(workExperience)
                    ? Arrays.asList("Java", "SQL", "Data Analysis", specialisation)
                    : Arrays.asList("Java", "SQL", specialisation);
        }
        return "Yes".equalsIgnoreCase(workExperience)
                ? Arrays.asList("Communication", "Excel", "Business Analysis", specialisation)
                : Arrays.asList("Communication", "Excel", specialisation);
    }

    private Double toCgpa(String percentage) {
        return Math.round((parseDouble(percentage, 0.0) / 10.0) * 100.0) / 100.0;
    }

    private Double toLpa(String salary) {
        double annualSalary = parseDouble(salary, 0.0);
        return annualSalary <= 0 ? null : Math.round((annualSalary / 100000.0) * 100.0) / 100.0;
    }

    private int parseInt(String value, int fallback) {
        try {
            return Integer.parseInt(value.trim());
        } catch (Exception ex) {
            return fallback;
        }
    }

    private double parseDouble(String value, double fallback) {
        try {
            return Double.parseDouble(value.trim());
        } catch (Exception ex) {
            return fallback;
        }
    }
}
