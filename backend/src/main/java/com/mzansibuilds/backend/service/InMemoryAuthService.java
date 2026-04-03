package com.mzansibuilds.backend.service;

import com.mzansibuilds.backend.dto.LoginRequest;
import com.mzansibuilds.backend.dto.RegisterRequest;
import com.mzansibuilds.backend.entity.DeveloperUser;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class InMemoryAuthService implements AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserDetailsService userDetailsService;

    public InMemoryAuthService(PasswordEncoder passwordEncoder, UserDetailsService userDetailsService) {
        this.passwordEncoder = passwordEncoder;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public DeveloperUser register(RegisterRequest request) {
        DeveloperUser user = new DeveloperUser();
        user.setId("user_" + System.currentTimeMillis());
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setBio(request.bio());
        user.setGithubLink(request.githubLink());
        user.setLinkedinLink(request.linkedinLink());
        return user;
    }

    @Override
    public DeveloperUser login(LoginRequest request) {
        UserDetails userDetails;
        try {
            userDetails = userDetailsService.loadUserByUsername(request.email());
        } catch (Exception exception) {
            throw new BadCredentialsException("Invalid credentials");
        }

        if (!passwordEncoder.matches(request.password(), userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        DeveloperUser user = new DeveloperUser();
        user.setId("user_1");
        user.setFullName("Developer User");
        user.setEmail(userDetails.getUsername());
        user.setBio("Backend-first builder preparing the MzansiBuilds assessment submission.");
        return user;
    }
}
