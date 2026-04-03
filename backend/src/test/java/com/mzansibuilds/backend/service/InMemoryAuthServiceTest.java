package com.mzansibuilds.backend.service;

import com.mzansibuilds.backend.dto.LoginRequest;
import com.mzansibuilds.backend.dto.RegisterRequest;
import com.mzansibuilds.backend.entity.DeveloperUser;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class InMemoryAuthServiceTest {

    private final InMemoryAuthService service = new InMemoryAuthService();

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
    }

    @Test
    void loginReturnsDeveloperProfile() {
        DeveloperUser user = service.login(new LoginRequest("martin@example.com", "password123"));

        assertEquals("martin@example.com", user.getEmail());
    }
}
