package com.mzansibuilds.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CommentRequest(
        @NotBlank String message
) {
}
