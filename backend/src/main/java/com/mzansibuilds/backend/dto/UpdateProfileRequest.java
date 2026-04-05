package com.mzansibuilds.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(
        @NotBlank String fullName,
        String bio,
        String githubLink,
        String linkedinLink
) {
}

