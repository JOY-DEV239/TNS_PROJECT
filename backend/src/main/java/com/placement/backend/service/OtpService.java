package com.placement.backend.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    private static final String FIXED_OTP = "123456";
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();

    public String generateOtp(String mobileNumber) {
        String otp = FIXED_OTP;
        otpStore.put(mobileNumber, otp);
        // Development logging - shows OTP in console during testing
        System.out.println("\n=====================================");
        System.out.println("OTP for " + mobileNumber + " : " + otp);
        System.out.println("=====================================\n");
        return otp;
    }

    public boolean validateOtp(String mobileNumber, String otp) {
        if (otp == null || mobileNumber == null) {
            return false;
        }
        if (FIXED_OTP.equals(otp.trim())) {
            return true;
        }
        String storedOtp = otpStore.get(mobileNumber);
        boolean isValid = otp.trim().equals(storedOtp);
        System.out.println("\n===== OTP VALIDATION DEBUG =====");
        System.out.println("Mobile: " + mobileNumber);
        System.out.println("Entered OTP: [" + otp + "] (trimmed: [" + otp.trim() + "])");
        System.out.println("Stored OTP: [" + storedOtp + "]");
        System.out.println("Valid: " + isValid);
        System.out.println("==============================\n");
        return isValid;
    }

    public void clearOtp(String mobileNumber) {
        otpStore.remove(mobileNumber);
    }
}
