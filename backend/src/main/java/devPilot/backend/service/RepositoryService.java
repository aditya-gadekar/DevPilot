package devPilot.backend.service;

import java.net.URI;
import java.util.Locale;

import org.springframework.stereotype.Service;

import devPilot.backend.repository.RepositoryRepository;

@Service
public class RepositoryService {

    private final RepositoryRepository repositoryRepository;

    public RepositoryService(RepositoryRepository repositoryRepository) {
        this.repositoryRepository = repositoryRepository;
    }

    public String validateGithubUrl(String url) {

        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("GitHub repository URL is required.");
        }

        try {
            URI uri = URI.create(url.trim());

            // Only HTTPS is allowed
            if (!"https".equalsIgnoreCase(uri.getScheme())) {
                throw new IllegalArgumentException("Only HTTPS GitHub URLs are allowed.");
            }

            // Only github.com is allowed
            if (uri.getHost() == null ||
                    !"github.com".equalsIgnoreCase(uri.getHost())) {
                throw new IllegalArgumentException("URL must belong to github.com.");
            }

            // Reject query parameters and fragments
            if (uri.getQuery() != null || uri.getFragment() != null) {
                throw new IllegalArgumentException("Invalid GitHub repository URL.");
            }

            // Extract repository path
            String path = uri.getPath();

            if (path == null || path.isBlank()) {
                throw new IllegalArgumentException("GitHub owner and repository are required.");
            }

            String[] parts = path.split("/");

            if (parts.length < 3) {
                throw new IllegalArgumentException("Invalid GitHub repository URL.");
            }

            String owner = parts[1];
            String repoName = parts[2];

            // Remove .git if present
            if (repoName.toLowerCase(Locale.ROOT).endsWith(".git")) {
                repoName = repoName.substring(0, repoName.length() - 4);
            }

            if (owner.isBlank() || repoName.isBlank()) {
                throw new IllegalArgumentException("Owner and repository name are required.");
            }

            // Reject additional path segments
            if (parts.length > 3) {
                throw new IllegalArgumentException(
                        "Please provide a repository URL, not a subpage URL."
                );
            }

            // Normalize the repository URL
            return "https://github.com/" + owner + "/" + repoName;

        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid GitHub repository URL.");
        }
    }

    public boolean isAlreadyImported(String url) {
        return repositoryRepository.existsByUrl(url);
    }
}