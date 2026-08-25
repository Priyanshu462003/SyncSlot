package com.syncslot.repository;

import com.syncslot.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser_Id(Long userId);
    List<Doctor> findBySpecialization_IdAndVerifiedTrue(Long specializationId);
    List<Doctor> findByVerifiedTrue();
}
