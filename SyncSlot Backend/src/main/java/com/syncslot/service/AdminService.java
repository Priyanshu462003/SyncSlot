package com.syncslot.service;

import com.syncslot.dto.AppointmentResponse;
import com.syncslot.dto.DoctorResponse;
import com.syncslot.entity.Doctor;
import com.syncslot.entity.Specialization;
import com.syncslot.exception.ResourceNotFoundException;
import com.syncslot.repository.AppointmentRepository;
import com.syncslot.repository.DoctorRepository;
import com.syncslot.repository.SpecializationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final SpecializationRepository specializationRepository;

    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(a -> AppointmentResponse.builder()
                        .id(a.getId())
                        .doctorId(a.getDoctor().getId())
                        .doctorName(a.getDoctor().getUser().getName())
                        .patientId(a.getPatient().getId())
                        .patientName(a.getPatient().getUser().getName())
                        .appointmentDate(a.getAppointmentDate())
                        .startTime(a.getStartTime())
                        .endTime(a.getEndTime())
                        .status(a.getStatus())
                        .build())
                .toList();
    }

    public List<DoctorResponse> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(d -> DoctorResponse.builder()
                        .doctorId(d.getId())
                        .name(d.getUser().getName())
                        .specialization(d.getSpecialization() != null ? d.getSpecialization().getName() : null)
                        .consultationFee(d.getConsultationFee())
                        .bio(d.getBio())
                        .verified(d.isVerified())
                        .build())
                .toList();
    }

    /**
     * Prevents self-declared doctor accounts from accepting bookings until an
     * admin verifies them - checked in AppointmentService.bookAppointment().
     */
    public void verifyDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        doctor.setVerified(true);
        doctorRepository.save(doctor);
    }

    public Specialization createSpecialization(String name) {
        return specializationRepository.save(Specialization.builder().name(name).build());
    }
}
