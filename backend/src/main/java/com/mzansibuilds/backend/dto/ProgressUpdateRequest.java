package com.mzansibuilds.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ProgressUpdateRequest(
        @NotBlank String milestone,
        @NotBlank String note
) {
}
