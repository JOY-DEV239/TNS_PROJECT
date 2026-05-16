package com.placement.backend.controller;

import com.placement.backend.entity.Company;
import com.placement.backend.entity.PlacementDrive;
import com.placement.backend.repository.CompanyRepository;
import com.placement.backend.repository.PlacementDriveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/drives")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PlacementDriveController {
    @Autowired
    private PlacementDriveRepository driveRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @GetMapping
    public List<PlacementDrive> getAllDrives() { return driveRepository.findAll(); }

    @PostMapping
    public PlacementDrive addDrive(@RequestBody PlacementDrive drive) {
        drive.setCompany(resolveCompany(drive.getCompany()));
        return driveRepository.save(drive);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlacementDrive> getDriveById(@PathVariable Long id) {
        return driveRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlacementDrive> updateDrive(@PathVariable Long id, @RequestBody PlacementDrive details) {
        return driveRepository.findById(id).map(d -> {
            d.setCompany(resolveCompany(details.getCompany()));
            d.setDriveDate(details.getDriveDate());
            d.setVenue(details.getVenue());
            d.setEligibilityCriteria(details.getEligibilityCriteria());
            d.setStatus(details.getStatus());
            return ResponseEntity.ok(driveRepository.save(d));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDrive(@PathVariable Long id) {
        return driveRepository.findById(id).map(d -> {
            driveRepository.delete(d);
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
