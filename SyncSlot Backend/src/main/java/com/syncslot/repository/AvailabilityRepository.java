package com.syncslot.repository;

import com.syncslot.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByDoctor_IdAndDayOfWeek(Long doctorId, DayOfWeek dayOfWeek);
    List<Availability> findByDoctor_Id(Long doctorId);
}
