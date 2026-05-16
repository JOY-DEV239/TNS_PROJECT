package com.placement.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Entity
@Table(name = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private Double minimumCgpa;
    
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> eligibleDepartments;
    
    private Double packageDetails; // in LPA
    
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> recruitmentRounds;
}
