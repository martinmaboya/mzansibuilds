package com.mzansibuilds.backend.dto;

import com.mzansibuilds.backend.entity.ProjectStage;
import com.mzansibuilds.backend.entity.SupportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProjectRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotNull ProjectStage stage,
        @NotNull SupportType supportRequired
) {
}
