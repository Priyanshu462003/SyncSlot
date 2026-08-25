package com.syncslot.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Composition, not inheritance: a Doctor HAS a User, it is not a User subtype.
    // This keeps CustomUserDetailsService simple - auth only ever touches UserRepository.
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne
    @JoinColumn(name = "specialization_id")
    private Specialization specialization;

    private BigDecimal consultationFee;

    @Column(length = 1000)
    private String bio;

    // Admin must verify a doctor before they can be booked - prevents self-declared doctors.
    @Builder.Default
    private boolean verified = false;
}
