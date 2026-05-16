package com.placement.backend.dto;
import lombok.Data;
@Data
public class VerifyOtpRequest {
    private String mobileNumber;
    private String otp;
}
