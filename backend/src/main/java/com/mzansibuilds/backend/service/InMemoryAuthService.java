package com.mzansibuilds.backend.service;

import com.mzansibuilds.backend.dto.LoginRequest;
import com.mzansibuilds.backend.dto.RegisterRequest;
import com.mzansibuilds.backend.entity.DeveloperUser;
import org.springframework.stereotype.Service;

@Service
public class InMemoryAuthService implements AuthService {

    @Override
    public DeveloperUser register(RegisterRequest request) {
        DeveloperUser user = new DeveloperUser();
        user.setId("user_" + System.currentTimeMillis());
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash("hashed-password-placeholder");
        user.setBio(request.bio());
        user.setGithubLink(request.githubLink());
        user.setLinkedinLink(request.linkedinLink());
        return user;
    }

    @Override
    public DeveloperUser login(LoginRequest request) {
        DeveloperUser user = new DeveloperUser();
        user.setId("user_1");
        user.setFullName("Martin Maboya");
        user.setEmail(request.email());
        user.setBio("Backend-first builder preparing the MzansiBuilds assessment submission.");
        return user;
    }
}
