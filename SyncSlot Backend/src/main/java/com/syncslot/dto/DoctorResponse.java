package com.syncslot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
public class DoctorResponse {
    private Long doctorId;
    private String name;
    private String specialization;
    private BigDecimal consultationFee;
    private String bio;
    private boolean verified;
}
