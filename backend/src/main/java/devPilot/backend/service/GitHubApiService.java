package devPilot.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class GitHubApiService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GitHubApiService(ObjectMapper objectMapper) {

        this.objectMapper = objectMapper;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public JsonNode getRepositoryMetadata(String owner, String repository)
            throws IOException, InterruptedException {

        String apiUrl = "https://api.github.com/repos/"
                + owner + "/" + repository;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .timeout(Duration.ofSeconds(20))
                .header("Accept", "application/vnd.github+json")
                .header("User-Agent", "DevPilot")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
        );

        int statusCode = response.statusCode();

        if (statusCode == 404) {
            throw new IllegalArgumentException(
                    "GitHub repository not found or repository is private."
            );
        }

        if (statusCode == 403) {
            throw new IllegalArgumentException(
                    "GitHub API rate limit exceeded or access denied."
            );
        }

        if (statusCode != 200) {
            throw new IllegalArgumentException(
                    "GitHub API request failed. HTTP status: " + statusCode
            );
        }

        return objectMapper.readTree(response.body());
    }
}