package com.placement.backend.controller;

import com.placement.backend.entity.Company;
import com.placement.backend.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CompanyController {
    @Autowired
    private CompanyRepository companyRepository;

    @GetMapping
    public List<Company> getAllCompanies() { return companyRepository.findAll(); }

    @PostMapping
    public Company addCompany(@RequestBody Company company) { return companyRepository.save(company); }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable Long id) {
        return companyRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable Long id, @RequestBody Company details) {
        return companyRepository.findById(id).map(c -> {
            c.setName(details.getName());
            c.setDescription(details.getDescription());
            c.setMinimumCgpa(details.getMinimumCgpa());
            c.setEligibleDepartments(details.getEligibleDepartments());
            c.setPackageDetails(details.getPackageDetails());
            c.setRecruitmentRounds(details.getRecruitmentRounds());
            return ResponseEntity.ok(companyRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCompany(@PathVariable Long id) {
        return companyRepository.findById(id).map(c -> {
            companyRepository.delete(c);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
