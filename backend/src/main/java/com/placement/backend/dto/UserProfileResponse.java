package com.placement.backend.dto;

import com.placement.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String mobileNumber;
    private String email;
    private Role role;
    private Boolean isFirstLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
