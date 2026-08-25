package com.syncslot.service;

import com.syncslot.dto.AuthResponse;
import com.syncslot.dto.LoginRequest;
import com.syncslot.dto.RegisterRequest;
import com.syncslot.entity.Doctor;
import com.syncslot.entity.Patient;
import com.syncslot.entity.Specialization;
import com.syncslot.entity.User;
import com.syncslot.enums.Role;
import com.syncslot.exception.ResourceNotFoundException;
import com.syncslot.repository.DoctorRepository;
import com.syncslot.repository.PatientRepository;
import com.syncslot.repository.SpecializationRepository;
import com.syncslot.repository.UserRepository;
import com.syncslot.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final SpecializationRepository specializationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    /**
     * Registration is transactional: the User row and its matching Doctor/Patient
     * profile row are created together, or not at all. This prevents an orphaned
     * User with no profile if something fails midway.
     *
     * Note: role is self-declared here for simplicity. In a production system a
     * self-declared DOCTOR should start as unverified (see Doctor.verified) and
     * be unable to accept bookings until an ADMIN verifies them.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();
        user = userRepository.save(user);

        if (request.getRole() == Role.DOCTOR) {
            Specialization specialization = null;
            if (request.getSpecializationId() != null) {
                specialization = specializationRepository.findById(request.getSpecializationId())
                        .orElseThrow(() -> new ResourceNotFoundException("Specialization not found"));
            }
            Doctor doctor = Doctor.builder()
                    .user(user)
                    .specialization(specialization)
                    .bio(request.getBio())
                    .verified(false) // must be verified by an ADMIN before accepting bookings
                    .build();
            doctorRepository.save(doctor);
        } else if (request.getRole() == Role.PATIENT) {
            Patient patient = Patient.builder()
                    .user(user)
                    .build();
            patientRepository.save(patient);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }
}
