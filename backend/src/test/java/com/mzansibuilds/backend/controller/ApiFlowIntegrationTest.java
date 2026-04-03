package com.mzansibuilds.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mzansibuilds.backend.repository.CollaborationRequestRepository;
import com.mzansibuilds.backend.repository.DeveloperUserRepository;
import com.mzansibuilds.backend.repository.ProgressUpdateRepository;
import com.mzansibuilds.backend.repository.ProjectCommentRepository;
import com.mzansibuilds.backend.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CollaborationRequestRepository collaborationRequestRepository;

    @Autowired
    private ProjectCommentRepository projectCommentRepository;

    @Autowired
    private ProgressUpdateRepository progressUpdateRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private DeveloperUserRepository developerUserRepository;

    @BeforeEach
    void setUp() {
        collaborationRequestRepository.deleteAll();
        projectCommentRepository.deleteAll();
        progressUpdateRepository.deleteAll();
        projectRepository.deleteAll();
        developerUserRepository.deleteAll();
    }

    @Test
    void authAndProjectEndpointsPersistToDatabase() throws Exception {
        String registerPayload = """
                {
                  "fullName": "Thabo Mokoena",
                  "email": "thabo.mokoena@example.com",
                  "password": "StrongPass123!",
                  "bio": "Full-stack developer",
                  "githubLink": "https://github.com/thabo",
                  "linkedinLink": "https://linkedin.com/in/thabo"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.email").value("thabo.mokoena@example.com"));

        String loginPayload = """
                {
                  "email": "thabo.mokoena@example.com",
                  "password": "StrongPass123!"
                }
                """;

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        JsonNode loginJson = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = loginJson.get("token").asText();

        String projectPayload = """
                {
                  "title": "MzansiBuilds",
                  "description": "Public build tracker",
                  "stage": "IN_PROGRESS",
                  "supportRequired": "BACKEND_HELP"
                }
                """;

        MvcResult createProjectResult = mockMvc.perform(post("/api/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("MzansiBuilds"))
                .andReturn();

        String projectId = objectMapper.readTree(createProjectResult.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(get("/api/projects/{id}", projectId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(projectId));

        mockMvc.perform(get("/api/feed")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(projectId));

        mockMvc.perform(post("/api/projects/{id}/updates", projectId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"milestone\":\"Auth\",\"note\":\"Connected DB\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectId").value(projectId));

        mockMvc.perform(post("/api/projects/{id}/comments", projectId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"Looks good\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectId").value(projectId));

        mockMvc.perform(post("/api/projects/{id}/raise-hand", projectId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"Can help\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OPEN"));

        mockMvc.perform(patch("/api/projects/{id}/complete", projectId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(true));

        mockMvc.perform(get("/api/celebration")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(projectId));

        mockMvc.perform(put("/api/projects/{id}", projectId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"MzansiBuilds v2\",\"description\":\"Updated\",\"stage\":\"TESTING\",\"supportRequired\":\"FEEDBACK\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("MzansiBuilds v2"));

        mockMvc.perform(delete("/api/projects/{id}", projectId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/projects/{id}", projectId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }
}


