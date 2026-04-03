package com.mzansibuilds.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CollaborationRequestDto(
        @NotBlank String message
) {
}
