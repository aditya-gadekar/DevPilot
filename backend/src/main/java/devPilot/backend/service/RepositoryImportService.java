
package devPilot.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

import devPilot.backend.entity.RepositoryEntity;
import devPilot.backend.entity.UserEntity;
import devPilot.backend.repository.RepositoryRepository;
import devPilot.backend.repository.UserRepository;

@Service
public class RepositoryImportService {

    private final RepositoryService repositoryService;
    private final GitHubApiService gitHubApiService;
    private final GitHubZipService gitHubZipService;
    private final ZipExtractionService zipExtractionService;
    private final RepositoryScannerService repositoryScannerService;
    private final RepositoryRepository repositoryRepository;
    private final UserRepository userRepository;

    private static final Path STORAGE_DIRECTORY =
            Path.of("devpilot-storage", "repositories");

    public RepositoryImportService(
            RepositoryService repositoryService,
            GitHubApiService gitHubApiService,
            GitHubZipService gitHubZipService,
            ZipExtractionService zipExtractionService,
            RepositoryScannerService repositoryScannerService,
            RepositoryRepository repositoryRepository,
            UserRepository userRepository) {

        this.repositoryService = repositoryService;
        this.gitHubApiService = gitHubApiService;
        this.gitHubZipService = gitHubZipService;
        this.zipExtractionService = zipExtractionService;
        this.repositoryScannerService = repositoryScannerService;
        this.repositoryRepository = repositoryRepository;
        this.userRepository = userRepository;
    }

    public RepositoryEntity importRepository(String githubUrl)
            throws IOException, InterruptedException {

        // 1. Get authenticated user's email
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // 2. Find authenticated user
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Authenticated user not found."
                ));

        // 3. Validate GitHub URL
        String validatedUrl =
                repositoryService.validateGithubUrl(githubUrl);

        // 4. Prevent duplicate imports for the same user
        if (repositoryRepository.existsByUrlAndUser(validatedUrl, user)) {
            throw new IllegalArgumentException(
                    "You have already imported this repository."
            );
        }

        // 5. Extract owner and repository name from URL
        String[] parts = validatedUrl.split("/");
        String owner = parts[3];
        String repoName = parts[4];

        // 6. Fetch GitHub metadata
        JsonNode metadata =
                gitHubApiService.getRepositoryMetadata(owner, repoName);

        String repositoryName = metadata.path("name").asText(repoName);
        String defaultBranch =
                metadata.path("default_branch").asText("main");

        // 7. Create a unique storage folder
        String folderId = UUID.randomUUID().toString();

        Path repositoryPath =
                STORAGE_DIRECTORY.resolve(folderId).toAbsolutePath().normalize();

        Files.createDirectories(repositoryPath);

        Path zipFile = null;

        try {

            // 8. Download repository ZIP
            zipFile = gitHubZipService.downloadRepository(
                    owner,
                    repoName,
                    defaultBranch
            );

            // 9. Extract repository ZIP
            zipExtractionService.extractZip(
                    zipFile,
                    repositoryPath
            );

            // 10. Scan repository files
            RepositoryScannerService.ScanResult scanResult =
                    repositoryScannerService.scanRepository(
                            repositoryPath
                    );

            // 11. Save repository metadata and ownership
            RepositoryEntity entity = new RepositoryEntity();

            entity.setName(repositoryName);
            entity.setOwner(owner);
            entity.setUrl(validatedUrl);
            entity.setDefaultBranch(defaultBranch);
            entity.setLocalPath(repositoryPath.toString());
            entity.setStatus("IMPORTED");
            entity.setTotalFiles(scanResult.totalFiles());
            entity.setSourceFiles(scanResult.sourceFiles());

            // Assign repository to authenticated user
            entity.setUser(user);

            return repositoryRepository.save(entity);

        } catch (Exception exception) {

            // Remove incomplete repository files
            deleteDirectory(repositoryPath);

            if (exception instanceof IOException ioException) {
                throw ioException;
            }

            if (exception instanceof InterruptedException interruptedException) {
                throw interruptedException;
            }

            if (exception instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }

            throw new IOException(
                    "Repository import failed.",
                    exception
            );

        } finally {

            // Remove temporary ZIP file
            if (zipFile != null) {
                Files.deleteIfExists(zipFile);
            }
        }
    }

    private void deleteDirectory(Path directory) throws IOException {

        if (!Files.exists(directory)) {
            return;
        }

        try (var paths = Files.walk(directory)) {

            paths.sorted((a, b) -> b.compareTo(a))
                    .forEach(path -> {

                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException exception) {
                            throw new RuntimeException(exception);
                        }
                    });
        }
    }
}
