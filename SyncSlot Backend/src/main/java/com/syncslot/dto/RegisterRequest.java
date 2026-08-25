package com.syncslot.dto;

import com.syncslot.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String name;

    @NotBlank @Email
    private String email;

    @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotNull(message = "role must be PATIENT or DOCTOR")
    private Role role;

    // Only used when role = DOCTOR
    private Long specializationId;
    private String bio;
}
