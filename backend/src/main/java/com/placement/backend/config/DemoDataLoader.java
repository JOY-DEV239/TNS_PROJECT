package com.placement.backend.config;

import com.placement.backend.entity.Company;
import com.placement.backend.repository.CompanyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DemoDataLoader implements CommandLineRunner {
    private final CompanyRepository companyRepository;

    public DemoDataLoader(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Override
    public void run(String... args) {
        seedCompany("TechNova Solutions", "A full-stack software services provider.", 7.5, Arrays.asList("CS", "AIML", "EC"), Arrays.asList("Written Test", "Technical Interview", "HR Interview"));
        seedCompany("Apex Analytics", "Data science and AI consulting firm.", 8.0, Arrays.asList("CS", "AIML"), Arrays.asList("Coding Round", "System Design", "HR Round"));
        seedCompany("CoreCircuits", "Embedded systems and electronics design.", 6.5, Arrays.asList("EC", "MECH"), Arrays.asList("Circuit Design", "Technical Interview", "HR Interview"));
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
}
