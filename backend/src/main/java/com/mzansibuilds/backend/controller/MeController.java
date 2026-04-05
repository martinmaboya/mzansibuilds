package com.mzansibuilds.backend.controller;

import com.mzansibuilds.backend.dto.UpdateProfileRequest;
import com.mzansibuilds.backend.entity.DeveloperUser;
import com.mzansibuilds.backend.exception.UserNotFoundException;
import com.mzansibuilds.backend.repository.DeveloperUserRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final DeveloperUserRepository developerUserRepository;

    public MeController(DeveloperUserRepository developerUserRepository) {
        this.developerUserRepository = developerUserRepository;
    }

    @GetMapping
    public DeveloperUser me(Principal principal) {
        return findUser(principal.getName());
    }

    @PatchMapping("/profile")
    public DeveloperUser updateProfile(Principal principal, @Valid @RequestBody UpdateProfileRequest request) {
        DeveloperUser user = findUser(principal.getName());
        user.setFullName(request.fullName());
        user.setBio(request.bio());
        user.setGithubLink(request.githubLink());
        user.setLinkedinLink(request.linkedinLink());
        return developerUserRepository.save(user);
    }

    private DeveloperUser findUser(String email) {
        return developerUserRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }
}

