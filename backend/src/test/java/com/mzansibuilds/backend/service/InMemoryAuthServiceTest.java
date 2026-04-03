package com.mzansibuilds.backend.service;

import com.mzansibuilds.backend.dto.LoginRequest;
import com.mzansibuilds.backend.dto.RegisterRequest;
import com.mzansibuilds.backend.entity.DeveloperUser;
import com.mzansibuilds.backend.repository.DeveloperUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class InMemoryAuthServiceTest {

    @Autowired
    private InMemoryAuthService service;

    @Autowired
    private DeveloperUserRepository developerUserRepository;

    @BeforeEach
    void setUp() {
        developerUserRepository.deleteAll();
    }

    @Test
    void registerPersistsDeveloperProfile() {
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
        assertTrue(developerUserRepository.findByEmail("martin@example.com").isPresent());
    }

    @Test
    void loginReturnsPersistedDeveloperProfile() {
        service.register(new RegisterRequest(
                "Developer User",
                "developer@example.com",
                "devpass123!",
                "Backend builder",
                null,
                null
        ));

        DeveloperUser user = service.login(new LoginRequest("developer@example.com", "devpass123!"));

        assertEquals("developer@example.com", user.getEmail());
    }
}
