package com.placement.backend.dto;
import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String mobileNumber;
    private String email;
    private String role;
    public JwtResponse(String token, Long id, String mobileNumber, String email, String role) {
        this.token = token;
        this.id = id;
        this.mobileNumber = mobileNumber;
        this.email = email;
        this.role = role;
    }
}
