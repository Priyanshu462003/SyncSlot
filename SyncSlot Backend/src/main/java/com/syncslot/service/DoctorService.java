package com.syncslot.service;

import com.syncslot.dto.AvailabilityRequest;
import com.syncslot.dto.DoctorAvailabilityResponse;
import com.syncslot.dto.DoctorResponse;
import com.syncslot.entity.Availability;
import com.syncslot.entity.Doctor;
import com.syncslot.entity.User;
import com.syncslot.exception.ResourceNotFoundException;
import com.syncslot.repository.AppointmentRepository;
import com.syncslot.repository.AvailabilityRepository;
import com.syncslot.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AvailabilityRepository availabilityRepository;
    private final AppointmentRepository appointmentRepository;

    public List<DoctorResponse> listVerifiedDoctors() {
        return doctorRepository.findByVerifiedTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    public DoctorResponse getDoctor(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return toResponse(doctor);
    }

    /**
     * Doctor sets their own recurring weekly working hours.
     * Ownership is enforced by the controller passing the authenticated user's
     * own doctorId - a doctor can never set another doctor's availability.
     */
    public void setAvailability(Long doctorId, AvailabilityRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("startTime must be before endTime");
        }

        Availability availability = Availability.builder()
                .doctor(doctor)
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .slotDurationMinutes(request.getSlotDurationMinutes())
                .build();

        availabilityRepository.save(availability);
    }

    /**
     * Computes open bookable slots for a doctor on a given date:
     * 1. Generate all candidate slots from the doctor's recurring Availability windows
     *    for that day of week.
     * 2. Remove slots that overlap an already-BOOKED appointment.
     *
     * This is a read-only convenience view for the UI - the actual safety guarantee
     * against double-booking still happens at booking time in AppointmentService,
     * via the pessimistic lock. This method alone is NOT sufficient to prevent
     * race conditions (two concurrent reads could both see the same "open" slot).
     */
    public DoctorAvailabilityResponse getOpenSlots(Long doctorId, LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();

        List<Availability> windows = availabilityRepository.findByDoctor_IdAndDayOfWeek(doctorId, dayOfWeek);

        List<LocalTime> candidateSlots = new ArrayList<>();
        for (Availability window : windows) {
            LocalTime cursor = window.getStartTime();
            while (!cursor.plusMinutes(window.getSlotDurationMinutes()).isAfter(window.getEndTime())) {
                candidateSlots.add(cursor);
                cursor = cursor.plusMinutes(window.getSlotDurationMinutes());
            }
        }

        Set<LocalTime> bookedStartTimes = appointmentRepository
                .findByDoctor_IdAndAppointmentDate(doctorId, date).stream()
                .filter(a -> a.getStatus() == com.syncslot.enums.AppointmentStatus.BOOKED)
                .map(a -> a.getStartTime())
                .collect(Collectors.toSet());

        List<LocalTime> openSlots = candidateSlots.stream()
                .filter(slot -> !bookedStartTimes.contains(slot))
                .toList();

        return DoctorAvailabilityResponse.builder()
                .doctorId(doctorId)
                .openSlots(openSlots)
                .build();
    }

    private DoctorResponse toResponse(Doctor doctor) {
        User user = doctor.getUser();
        return DoctorResponse.builder()
                .doctorId(doctor.getId())
                .name(user.getName())
                .specialization(doctor.getSpecialization() != null ? doctor.getSpecialization().getName() : null)
                .consultationFee(doctor.getConsultationFee())
                .bio(doctor.getBio())
                .verified(doctor.isVerified())
                .build();
    }
}
