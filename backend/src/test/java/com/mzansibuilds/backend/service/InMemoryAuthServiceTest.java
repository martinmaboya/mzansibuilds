package com.mzansibuilds.backend.service;

import com.mzansibuilds.backend.dto.LoginRequest;
import com.mzansibuilds.backend.dto.RegisterRequest;
import com.mzansibuilds.backend.entity.DeveloperUser;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class InMemoryAuthServiceTest {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final UserDetailsService userDetailsService = username -> User.withUsername("developer@example.com")
            .password(passwordEncoder.encode("devpass123!"))
            .roles("USER")
            .build();

    private final InMemoryAuthService service = new InMemoryAuthService(passwordEncoder, userDetailsService);

    @Test
    void registerReturnsDeveloperProfile() {
        RegisterRequest request = new RegisterRequest(
                "Martin Maboya",
                "martin@example.com",
                "password123",
                "Aspiring backend-first builder",
                "https://github.com/martinmaboya",
                "https://linkedin.com/in/martinmaboya"
        );

        DeveloperUser user = service.register(request);

        assertEquals("Martin Maboya", user.getFullName());
        assertEquals("martin@example.com", user.getEmail());
        assertNotEquals("password123", user.getPasswordHash());
    }

    @Test
    void loginReturnsDeveloperProfile() {
        DeveloperUser user = service.login(new LoginRequest("developer@example.com", "devpass123!"));

        assertEquals("developer@example.com", user.getEmail());
    }
}
