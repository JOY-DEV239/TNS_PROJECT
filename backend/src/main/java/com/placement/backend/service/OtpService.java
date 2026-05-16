package com.placement.backend.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@Service
public class OtpService {
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public String generateOtp(String mobileNumber) {
        String otp = String.format("%06d", random.nextInt(999999));
        otpStore.put(mobileNumber, otp);
        System.out.println("====== OTP FOR " + mobileNumber + " IS: " + otp + " ======");
        return otp;
    }

    public boolean validateOtp(String mobileNumber, String otp) {
        return otp != null && otp.equals(otpStore.get(mobileNumber));
    }

    public void clearOtp(String mobileNumber) {
        otpStore.remove(mobileNumber);
    }
}
