package com.placement.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "placement_drives")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlacementDrive {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private LocalDateTime driveDate;
    private String venue;
    private String eligibilityCriteria;

    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> interviewRounds;
    
    @Enumerated(EnumType.STRING)
    private DriveStatus status;
}
