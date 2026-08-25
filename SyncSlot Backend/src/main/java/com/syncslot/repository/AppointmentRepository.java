package com.syncslot.repository;

import com.syncslot.entity.Appointment;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    /**
     * THE CORE CONCURRENCY-SAFE QUERY.
     *
     * Detects any BOOKED appointment for this doctor, on this date, whose time
     * range overlaps the requested [startTime, endTime) window:
     *      existing.start < requestedEnd  AND  existing.end > requestedStart
     *
     * PESSIMISTIC_WRITE acquires a DB-level row lock (SELECT ... FOR UPDATE) on
     * every matching row for the duration of the enclosing transaction. Combined
     * with @Transactional on the calling service method, this closes the gap a
     * naive "check availability, then insert" approach would leave open: a second
     * concurrent request for the same doctor/date is forced to wait for this lock
     * before it can even read the current state, so it will always see the
     * just-inserted row and correctly reject the booking.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
           SELECT a FROM Appointment a
           WHERE a.doctor.id = :doctorId
             AND a.appointmentDate = :date
             AND a.status = com.syncslot.enums.AppointmentStatus.BOOKED
             AND a.startTime < :requestedEnd
             AND a.endTime > :requestedStart
           """)
    List<Appointment> findConflictingAppointments(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("requestedStart") LocalTime requestedStart,
            @Param("requestedEnd") LocalTime requestedEnd
    );

    List<Appointment> findByPatient_Id(Long patientId);

    List<Appointment> findByDoctor_Id(Long doctorId);

    List<Appointment> findByDoctor_IdAndAppointmentDate(Long doctorId, LocalDate date);
}
