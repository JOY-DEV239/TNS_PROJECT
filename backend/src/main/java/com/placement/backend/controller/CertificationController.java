package com.placement.backend.controller;

import com.placement.backend.entity.Certification;
import com.placement.backend.entity.Student;
import com.placement.backend.repository.CertificationRepository;
import com.placement.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/certifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CertificationController {
    private final CertificationRepository certRepository;
    private final StudentRepository studentRepository;
    private final Path uploadDir = Paths.get("cert_uploads");

    @Autowired
    public CertificationController(CertificationRepository certRepository, StudentRepository studentRepository) {
        this.certRepository = certRepository;
        this.studentRepository = studentRepository;
    }

    @GetMapping
    public List<Certification> getAll() {
        return certRepository.findAll();
    }

    @PostMapping("/upload")
    public Certification uploadCertificate(
            @RequestParam Long studentId,
            @RequestParam String name,
            @RequestParam String issuingAuthority,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDate,
            @RequestPart MultipartFile file
    ) throws IOException {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid student ID."));

        Files.createDirectories(uploadDir);
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "_" + originalFilename;
        Path targetPath = uploadDir.resolve(filename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        Certification certification = new Certification();
        certification.setStudent(student);
        certification.setName(name);
        certification.setIssuingAuthority(issuingAuthority);
        certification.setIssueDate(issueDate);
        certification.setDocumentUrl(filename);
        return certRepository.save(certification);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> download(@PathVariable Long id) throws MalformedURLException {
        Certification certification = certRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Certification not found."));

        Path filePath = uploadDir.resolve(certification.getDocumentUrl()).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists()) {
            throw new IllegalArgumentException("File not found.");
        }

        String downloadName = Paths.get(certification.getDocumentUrl()).getFileName().toString();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCertification(@PathVariable Long id) throws IOException {
        return certRepository.findById(id).map(c -> {
            try {
                Path filePath = uploadDir.resolve(c.getDocumentUrl()).normalize();
                Files.deleteIfExists(filePath);
            } catch (IOException ignored) {
            }
            certRepository.delete(c);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Certification> updateCertification(@PathVariable Long id, @RequestBody Certification details) {
        return certRepository.findById(id).map(c -> {
            c.setName(details.getName());
            c.setIssuingAuthority(details.getIssuingAuthority());
            c.setIssueDate(details.getIssueDate());
            return ResponseEntity.ok(certRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }
}
