package com.placement.backend.controller;

import com.placement.backend.dto.*;
import com.placement.backend.entity.Role;
import com.placement.backend.entity.User;
import com.placement.backend.repository.UserRepository;
import com.placement.backend.security.JwtUtils;
import com.placement.backend.security.UserDetailsImpl;
import com.placement.backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    @Autowired AuthenticationManager authenticationManager;
    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder encoder;
    @Autowired JwtUtils jwtUtils;
    @Autowired OtpService otpService;

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody OtpRequest request) {
        if (!userRepository.findByMobileNumber(request.getMobileNumber()).isPresent()) {
            User user = new User();
            user.setMobileNumber(request.getMobileNumber());
            user.setRole(Role.COORDINATOR);
            user.setIsFirstLogin(true);
            userRepository.save(user);
        }
        otpService.generateOtp(request.getMobileNumber());
        return ResponseEntity.ok(new MessageResponse("OTP sent successfully to " + request.getMobileNumber()));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        if (otpService.validateOtp(request.getMobileNumber(), request.getOtp())) {
            otpService.clearOtp(request.getMobileNumber());
            User user = userRepository.findByMobileNumber(request.getMobileNumber()).orElseThrow();
            if (user.getIsFirstLogin()) {
                return ResponseEntity.ok(new MessageResponse("OTP Verified. Please configure email and password."));
            } else {
                return ResponseEntity.ok(new MessageResponse("OTP Verified. Proceed to login."));
            }
        }
        return ResponseEntity.badRequest().body(new MessageResponse("Invalid OTP"));
    }

    @PostMapping("/setup-password")
    public ResponseEntity<?> setupPassword(@RequestBody PasswordSetupRequest request) {
        User user = userRepository.findByMobileNumber(request.getMobileNumber()).orElseThrow();
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email is already in use."));
        }
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setIsFirstLogin(false);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Password setup successfully."));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findByMobileNumber(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(new UserProfileResponse(
                user.getId(),
                user.getMobileNumber(),
                user.getEmail(),
                user.getRole(),
                user.getIsFirstLogin(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@RequestBody UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findByMobileNumber(userDetails.getUsername()).orElseThrow();

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Email is already in use."));
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(encoder.encode(request.getPassword()));
        }
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getMobileNumber(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateToken(loginRequest.getMobileNumber());

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(jwt, userDetails.getId(), userDetails.getUsername(), userDetails.getEmail(), userDetails.getAuthorities().iterator().next().getAuthority()));
    }
}
