package com.syncslot.service;

import com.syncslot.dto.AppointmentRequest;
import com.syncslot.dto.AppointmentResponse;
import com.syncslot.entity.Appointment;
import com.syncslot.entity.Availability;
import com.syncslot.entity.Doctor;
import com.syncslot.entity.Patient;
import com.syncslot.enums.AppointmentStatus;
import com.syncslot.exception.BookingConflictException;
import com.syncslot.exception.ResourceNotFoundException;
import com.syncslot.repository.AppointmentRepository;
import com.syncslot.repository.AvailabilityRepository;
import com.syncslot.repository.DoctorRepository;
import com.syncslot.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    /**
     * THE CORE ENGINEERING STORY OF THIS PROJECT.
     *
     * Guarantees a doctor's time slot cannot be double-booked, even when multiple
     * patients send overlapping booking requests at nearly the same instant.
     *
     * Order of operations matters:
     *   1. Business-rule check: is the requested time inside the doctor's declared
     *      working hours? (cheap, no lock needed - rejects clearly invalid requests early)
     *   2. Concurrency-safe check: query for conflicting BOOKED appointments using
     *      PESSIMISTIC_WRITE. Because this whole method is @Transactional, the row
     *      lock acquired by the query is held all the way through the final save().
     *      A second concurrent request for the same doctor/date has to wait for this
     *      transaction to commit or roll back before it can even read the current
     *      state - so it is guaranteed to see this booking and correctly reject itself.
     *   3. Only if both checks pass do we persist the new Appointment.
     */
    @Transactional
    public AppointmentResponse bookAppointment(Long patientUserId, AppointmentRequest request) {
        Patient patient = patientRepository.findByUser_Id(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (!doctor.isVerified()) {
            throw new IllegalArgumentException("This doctor is not yet verified and cannot accept bookings");
        }

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }

        // 1. Business rule: requested time must fall within a declared availability window
        boolean withinAvailability = availabilityRepository
                .findByDoctor_IdAndDayOfWeek(doctor.getId(), request.getAppointmentDate().getDayOfWeek())
                .stream()
                .anyMatch(w -> !request.getStartTime().isBefore(w.getStartTime())
                        && !request.getEndTime().isAfter(w.getEndTime()));

        if (!withinAvailability) {
            throw new IllegalArgumentException("Requested time is outside the doctor's working hours");
        }

        // 2. Concurrency-safe overlap check - acquires PESSIMISTIC_WRITE locks on any
        //    conflicting rows, held for the rest of this transaction.
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                doctor.getId(),
                request.getAppointmentDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "This slot was just booked by another patient. Please choose a different time.");
        }

        // 3. Safe to persist - no concurrent request could have slipped in under this lock.
        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(request.getAppointmentDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(AppointmentStatus.BOOKED)
                .build();

        appointment = appointmentRepository.save(appointment);
        return toResponse(appointment);
    }

    public List<AppointmentResponse> getMyAppointments(Long patientUserId) {
        Patient patient = patientRepository.findByUser_Id(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        return appointmentRepository.findByPatient_Id(patient.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AppointmentResponse> getDoctorAppointments(Long doctorUserId) {
        Doctor doctor = doctorRepository.findByUser_Id(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        return appointmentRepository.findByDoctor_Id(doctor.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Patient-owns-appointment check. Enforced here in addition to any
     * @PreAuthorize at the controller, since ownership depends on data
     * (whose patient_id this appointment row has), not just the caller's role.
     */
    @Transactional
    public void cancelAppointment(Long patientUserId, Long appointmentId) {
        Patient patient = patientRepository.findByUser_Id(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw new AccessDeniedException("You can only cancel your own appointments");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    /**
     * Doctor-owns-schedule check - the second independent ownership dimension
     * in this system, distinct from patient-owns-appointment above.
     */
    @Transactional
    public void completeAppointment(Long doctorUserId, Long appointmentId) {
        Doctor doctor = doctorRepository.findByUser_Id(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new AccessDeniedException("You can only manage your own appointments");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);
    }

    private AppointmentResponse toResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .doctorId(a.getDoctor().getId())
                .doctorName(a.getDoctor().getUser().getName())
                .patientId(a.getPatient().getId())
                .patientName(a.getPatient().getUser().getName())
                .appointmentDate(a.getAppointmentDate())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .status(a.getStatus())
                .build();
    }
}
