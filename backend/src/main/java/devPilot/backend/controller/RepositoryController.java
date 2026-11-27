
package devPilot.backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import devPilot.backend.dto.RepositoryImportRequest;
import devPilot.backend.entity.RepositoryEntity;
import devPilot.backend.entity.UserEntity;
import devPilot.backend.repository.RepositoryRepository;
import devPilot.backend.repository.UserRepository;
import devPilot.backend.service.RepositoryChunkingService;
import devPilot.backend.service.RepositoryImportService;
import devPilot.backend.service.RepositoryIndexingService;
import devPilot.backend.service.RepositoryScannerService;
import devPilot.backend.service.RepositoryStructureService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/repositories")
public class RepositoryController {

    private final RepositoryImportService repositoryImportService;
    private final RepositoryRepository repositoryRepository;
    private final UserRepository userRepository;
    private final RepositoryScannerService repositoryScannerService;
    private final RepositoryStructureService repositoryStructureService;
    private final RepositoryChunkingService repositoryChunkingService;
    private final RepositoryIndexingService repositoryIndexingService;

    public RepositoryController(
            RepositoryImportService repositoryImportService,
            RepositoryRepository repositoryRepository,
            UserRepository userRepository,
            RepositoryScannerService repositoryScannerService,
            RepositoryStructureService repositoryStructureService,
            RepositoryChunkingService repositoryChunkingService,
            RepositoryIndexingService repositoryIndexingService) {

        this.repositoryImportService = repositoryImportService;
        this.repositoryRepository = repositoryRepository;
        this.userRepository = userRepository;
        this.repositoryScannerService = repositoryScannerService;
        this.repositoryStructureService = repositoryStructureService;
        this.repositoryChunkingService = repositoryChunkingService;
        this.repositoryIndexingService = repositoryIndexingService;
    }

    // Get authenticated user
    private UserEntity getCurrentUser() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Authenticated user not found"
                        )
                );
    }

    // Get repository only if owned by authenticated user
    private RepositoryEntity getOwnedRepository(Long id) {

        UserEntity user = getCurrentUser();

        return repositoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Repository not found"
                        )
                );
    }

    // Import GitHub repository
    @PostMapping("/import")
    public RepositoryEntity importRepository(
            @Valid @RequestBody RepositoryImportRequest request)
            throws Exception {

        try {
            return repositoryImportService.importRepository(
                    request.getUrl()
            );
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    exception.getMessage()
            );
        }
    }

    // Get repositories belonging to authenticated user
    @GetMapping
    public List<RepositoryEntity> getAllRepositories() {

        UserEntity user = getCurrentUser();

        return repositoryRepository.findByUser(user);
    }

    // Get repository details (owner only)
    @GetMapping("/{id}")
    public RepositoryEntity getRepositoryById(@PathVariable Long id) {

        return getOwnedRepository(id);
    }

    // Get repository structure and analysis (owner only)
    @GetMapping("/{id}/structure")
    public Map<String, Object> getRepositoryStructure(
            @PathVariable Long id) throws IOException {

        RepositoryEntity repository = getOwnedRepository(id);

        return repositoryStructureService.getRepositoryStructure(
                repository
        );
    }

    // Get repository source file list (owner only)
    @GetMapping("/{id}/files")
    public List<String> getRepositoryFiles(@PathVariable Long id)
            throws IOException {

        RepositoryEntity repository = getOwnedRepository(id);

        Path repositoryPath = Path.of(repository.getLocalPath());

        RepositoryScannerService.ScanResult scanResult =
                repositoryScannerService.scanRepository(
                        repositoryPath
                );

        return scanResult.files();
    }

    // Get source code of a selected file (owner only)
    @GetMapping("/{id}/file")
    public Map<String, Object> getRepositoryFileContent(
            @PathVariable Long id,
            @RequestParam String path) throws IOException {

        RepositoryEntity repository = getOwnedRepository(id);

        Path repositoryRoot = Path.of(repository.getLocalPath())
                .toAbsolutePath()
                .normalize();

        Path requestedFile = repositoryRoot.resolve(path)
                .normalize()
                .toAbsolutePath();

        // Prevent access to files outside the repository
        if (!requestedFile.startsWith(repositoryRoot)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid file path"
            );
        }

        // Ensure the file exists and is a regular file
        if (!Files.exists(requestedFile) ||
                !Files.isRegularFile(requestedFile)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "File not found"
            );
        }

        // Only allow supported source files
        RepositoryScannerService.ScanResult scanResult =
                repositoryScannerService.scanRepository(
                        repositoryRoot
                );

        String relativePath = repositoryRoot
                .relativize(requestedFile)
                .toString()
                .replace("\\", "/");

        if (!scanResult.files().contains(relativePath)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported file"
            );
        }

        String content = Files.readString(requestedFile);

        return Map.of(
                "repositoryId", repository.getId(),
                "repositoryName", repository.getName(),
                "filePath", relativePath,
                "fileName", requestedFile.getFileName().toString(),
                "content", content
        );
    }

    // Get repository code chunks (owner only)
    @GetMapping("/{id}/chunks")
    public Map<String, Object> getRepositoryChunks(
            @PathVariable Long id) throws IOException {

        RepositoryEntity repository = getOwnedRepository(id);

        Path repositoryPath = Path.of(repository.getLocalPath());

        RepositoryScannerService.ScanResult scanResult =
                repositoryScannerService.scanRepository(
                        repositoryPath
                );

        List<RepositoryChunkingService.CodeChunk> chunks =
                repositoryChunkingService.chunkRepository(
                        repositoryPath,
                        scanResult.files()
                );

        return Map.of(
                "repositoryId", repository.getId(),
                "repositoryName", repository.getName(),
                "totalFiles", scanResult.sourceFiles(),
                "totalChunks", chunks.size(),
                "chunks", chunks
        );
    }

    // Index repository and generate/store embeddings (owner only)
    @PostMapping("/{id}/index")
    public RepositoryIndexingService.IndexingResult indexRepository(
            @PathVariable Long id) {

        // Verify repository ownership before indexing
        getOwnedRepository(id);

        try {
            return repositoryIndexingService.indexRepository(id);
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to index repository",
                    exception
            );
        }
    }
}
