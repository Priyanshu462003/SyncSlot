package com.syncslot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class DoctorAvailabilityResponse {
    private Long doctorId;
    private List<LocalTime> openSlots;
}
