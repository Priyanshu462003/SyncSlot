package com.syncslot.controller;

import com.syncslot.dto.AppointmentRequest;
import com.syncslot.dto.AppointmentResponse;
import com.syncslot.entity.User;
import com.syncslot.exception.ResourceNotFoundException;
import com.syncslot.repository.UserRepository;
import com.syncslot.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponse> book(Authentication authentication,
                                                      @Valid @RequestBody AppointmentRequest request) {
        Long userId = currentUserId(authentication);
        AppointmentResponse response = appointmentService.bookAppointment(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentResponse>> myAppointments(Authentication authentication) {
        Long userId = currentUserId(authentication);
        return ResponseEntity.ok(appointmentService.getMyAppointments(userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Void> cancel(Authentication authentication, @PathVariable Long id) {
        Long userId = currentUserId(authentication);
        // Ownership (does this appointment actually belong to this patient?) is
        // re-checked inside the service, since @PreAuthorize alone can only verify
        // role, not row-level ownership.
        appointmentService.cancelAppointment(userId, id);
        return ResponseEntity.noContent().build();
    }

    private Long currentUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
