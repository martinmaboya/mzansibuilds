package com.mzansibuilds.backend.service;

import com.mzansibuilds.backend.dto.LoginRequest;
import com.mzansibuilds.backend.dto.RegisterRequest;
import com.mzansibuilds.backend.entity.DeveloperUser;

public interface AuthService {
    DeveloperUser register(RegisterRequest request);
    DeveloperUser login(LoginRequest request);
}
