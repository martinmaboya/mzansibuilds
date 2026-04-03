package com.mzansibuilds.backend.service;

import com.mzansibuilds.backend.dto.LoginRequest;
import com.mzansibuilds.backend.dto.RegisterRequest;
import com.mzansibuilds.backend.entity.DeveloperUser;
import com.mzansibuilds.backend.repository.DeveloperUserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class InMemoryAuthService implements AuthService {

    private final DeveloperUserRepository developerUserRepository;
    private final PasswordEncoder passwordEncoder;

    public InMemoryAuthService(DeveloperUserRepository developerUserRepository, PasswordEncoder passwordEncoder) {
        this.developerUserRepository = developerUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public DeveloperUser register(RegisterRequest request) {
        if (developerUserRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered");
        }

        DeveloperUser user = new DeveloperUser();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setBio(request.bio());
        user.setGithubLink(request.githubLink());
        user.setLinkedinLink(request.linkedinLink());
        return developerUserRepository.save(user);
    }

    @Override
    public DeveloperUser login(LoginRequest request) {
        DeveloperUser user = developerUserRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        return user;
    }
}
