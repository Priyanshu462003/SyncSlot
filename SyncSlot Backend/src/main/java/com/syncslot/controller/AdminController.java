package com.syncslot.controller;

import com.syncslot.dto.AppointmentResponse;
import com.syncslot.dto.DoctorResponse;
import com.syncslot.entity.Specialization;
import com.syncslot.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorResponse>> allDoctors() {
        return ResponseEntity.ok(adminService.getAllDoctors());
    }

    @PutMapping("/doctors/{id}/verify")
    public ResponseEntity<Void> verifyDoctor(@PathVariable Long id) {
        adminService.verifyDoctor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponse>> allAppointments() {
        return ResponseEntity.ok(adminService.getAllAppointments());
    }

    @PostMapping("/specializations")
    public ResponseEntity<Specialization> createSpecialization(@RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createSpecialization(body.get("name")));
    }
}
