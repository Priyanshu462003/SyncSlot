package com.syncslot.controller;

import com.syncslot.dto.AppointmentResponse;
import com.syncslot.dto.AvailabilityRequest;
import com.syncslot.dto.DoctorAvailabilityResponse;
import com.syncslot.dto.DoctorResponse;
import com.syncslot.entity.Doctor;
import com.syncslot.entity.User;
import com.syncslot.exception.ResourceNotFoundException;
import com.syncslot.repository.DoctorRepository;
import com.syncslot.repository.UserRepository;
import com.syncslot.service.AppointmentService;
import com.syncslot.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final AppointmentService appointmentService;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;

    // ---- Public browsing ----

    @GetMapping("/api/doctors")
    public ResponseEntity<List<DoctorResponse>> listDoctors() {
        return ResponseEntity.ok(doctorService.listVerifiedDoctors());
    }

    @GetMapping("/api/doctors/{id}")
    public ResponseEntity<DoctorResponse> getDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctor(id));
    }

    @GetMapping("/api/doctors/{id}/availability")
    public ResponseEntity<DoctorAvailabilityResponse> getAvailability(
            @PathVariable Long id,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(doctorService.getOpenSlots(id, date));
    }

    // ---- Doctor-only, own-resource endpoints ----
    // Ownership is enforced by deriving the doctor's own id from the authenticated
    // principal - a doctor can never pass someone else's doctorId in the request body.

    @PostMapping("/api/doctor/availability")
    public ResponseEntity<Void> setAvailability(Authentication authentication,
                                                 @Valid @RequestBody AvailabilityRequest request) {
        Long doctorId = currentDoctorId(authentication);
        doctorService.setAvailability(doctorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/api/doctor/appointments")
    public ResponseEntity<List<AppointmentResponse>> myAppointments(Authentication authentication) {
        Long userId = currentUserId(authentication);
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(userId));
    }

    @PutMapping("/api/doctor/appointments/{id}/complete")
    public ResponseEntity<Void> completeAppointment(Authentication authentication, @PathVariable Long id) {
        Long userId = currentUserId(authentication);
        appointmentService.completeAppointment(userId, id);
        return ResponseEntity.noContent().build();
    }

    private Long currentUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }

    private Long currentDoctorId(Authentication authentication) {
        Long userId = currentUserId(authentication);
        Doctor doctor = doctorRepository.findByUser_Id(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        return doctor.getId();
    }
}
