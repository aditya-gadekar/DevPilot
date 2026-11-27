package devPilot.backend.service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import devPilot.backend.entity.CodeChunk;
import devPilot.backend.entity.RepositoryEntity;
import devPilot.backend.repository.RepositoryRepository;

@Service
public class RepositoryIndexingService {

    private final RepositoryRepository repositoryRepository;
    private final RepositoryScannerService scannerService;
    private final RepositoryChunkingService chunkingService;
    private final CodeChunkStorageService storageService;

    public RepositoryIndexingService(
            RepositoryRepository repositoryRepository,
            RepositoryScannerService scannerService,
            RepositoryChunkingService chunkingService,
            CodeChunkStorageService storageService
    ) {
        this.repositoryRepository = repositoryRepository;
        this.scannerService = scannerService;
        this.chunkingService = chunkingService;
        this.storageService = storageService;
    }

    public IndexingResult indexRepository(Long repositoryId)
            throws IOException {

        // 1. Find repository
        RepositoryEntity repository = repositoryRepository
                .findById(repositoryId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Repository not found"));

        // 2. Get local repository path
        Path repositoryPath = Path.of(repository.getLocalPath())
                .toAbsolutePath()
                .normalize();

        // 3. Scan repository files
        RepositoryScannerService.ScanResult scanResult =
                scannerService.scanRepository(repositoryPath);

        // 4. Chunk source files
        List<RepositoryChunkingService.CodeChunk> chunks =
                chunkingService.chunkRepository(
                        repositoryPath,
                        scanResult.files()
                );

        // 5. Convert chunk records to database entities
        List<CodeChunk> databaseChunks = new ArrayList<>();

        for (RepositoryChunkingService.CodeChunk chunk : chunks) {

            databaseChunks.add(new CodeChunk(
                    repositoryId,
                    chunk.filePath(),
                    chunk.chunkIndex(),
                    chunk.startLine(),
                    chunk.endLine(),
                    chunk.content()
            ));
        }

        // 6. Generate embeddings and store in PostgreSQL
        storageService.storeChunks(repositoryId, databaseChunks);
        repository.setStatus("INDEXED");
repository.setSourceFiles(scanResult.sourceFiles());
repositoryRepository.save(repository);

        // 7. Return indexing summary
        return new IndexingResult(
                repositoryId,
                repository.getName(),
                scanResult.sourceFiles(),
                chunks.size(),
                "INDEXED"
        );
    }

    public record IndexingResult(
            Long repositoryId,
            String repositoryName,
            int sourceFiles,
            int totalChunks,
            String status
    ) {
    }
}