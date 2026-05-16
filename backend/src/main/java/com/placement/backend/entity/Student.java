package com.placement.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String registerNumber;
    private String department;
    private Double cgpa;
    
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> technicalSkills;
    
    private String resumeUrl;

    private Integer interviewsAttended = 0;
    
    @Enumerated(EnumType.STRING)
    private PlacementStatus placementStatus = PlacementStatus.UNPLACED;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "selected_company_id")
    private Company selectedCompany;
    
    private Double salaryPackage;
}
