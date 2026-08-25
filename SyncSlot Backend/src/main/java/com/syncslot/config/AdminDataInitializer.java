package com.syncslot.config;


import com.syncslot.entity.User;
import com.syncslot.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import static com.syncslot.enums.Role.ADMIN;

@Configuration
public class AdminDataInitializer {

    @Bean
    CommandLineRunner createDefaultAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            String adminEmail = "admin@syncslot.com";

            if (userRepository.findByEmail(adminEmail).isEmpty()) {

                User admin = new User();

                admin.setName("SyncSlot Admin");
                admin.setEmail(adminEmail);
                admin.setPassword(
                        passwordEncoder.encode("Admin@12345")
                );
                admin.setRole(ADMIN);

                userRepository.save(admin);

                System.out.println("=================================");
                System.out.println("DEFAULT ADMIN CREATED");
                System.out.println("Email: admin@syncslot.com");
                System.out.println("Password: Admin@12345");
                System.out.println("=================================");
            }
        };
    }
}