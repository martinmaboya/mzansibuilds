package com.mzansibuilds.backend.repository;

import com.mzansibuilds.backend.entity.DeveloperUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeveloperUserRepository extends JpaRepository<DeveloperUser, String> {
    Optional<DeveloperUser> findByEmail(String email);
}
