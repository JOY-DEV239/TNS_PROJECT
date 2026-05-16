package com.placement.backend.dto;
import lombok.Data;
@Data
public class PasswordSetupRequest {
    private String mobileNumber;
    private String email;
    private String password;
}
