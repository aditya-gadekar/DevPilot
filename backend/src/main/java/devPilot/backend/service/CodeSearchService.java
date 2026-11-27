package devPilot.backend.service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import devPilot.backend.entity.CodeChunk;
import devPilot.backend.repository.CodeChunkSearchRepository;

@Service
public class CodeSearchService {

    private final EmbeddingService embeddingService;
    private final CodeChunkSearchRepository searchRepository;

    public CodeSearchService(
            EmbeddingService embeddingService,
            CodeChunkSearchRepository searchRepository) {

        this.embeddingService = embeddingService;
        this.searchRepository = searchRepository;
    }

    public List<CodeChunk> search(
            Long repositoryId,
            String query,
            int limit) {

        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException(
                    "Search query cannot be empty");
        }

        if (limit <= 0 || limit > 50) {
            throw new IllegalArgumentException(
                    "Limit must be between 1 and 50");
        }

        float[] queryEmbedding =
                embeddingService.generateEmbedding(query);

        int candidateLimit = Math.min(limit * 10, 50);

        List<CodeChunk> candidates =
                searchRepository.searchSimilarChunks(
                        repositoryId,
                        queryEmbedding,
                        candidateLimit
                );

        return candidates.stream()
                .sorted(Comparator.comparingInt(
                        chunk -> getFilePriority(chunk.getFilePath())))
                .limit(limit)
                .toList();
    }

    private int getFilePriority(String filePath) {

        if (filePath == null) {
            return 10;
        }

        String path = filePath.toLowerCase(Locale.ROOT);

        // Exclude examples, tests and documentation from implementation priority
        boolean isExample = path.contains("/examples/")
                || path.startsWith("examples/");

        boolean isTest = path.contains("/test/")
                || path.contains("/tests/")
                || path.startsWith("test/")
                || path.startsWith("tests/");

        // Core implementation files
        if (!isExample && !isTest
                && (path.contains("/lib/")
                || path.startsWith("lib/"))) {
            return 0;
        }

        // Main entry point - only if not inside examples or tests
        if (!isExample && !isTest
                && (path.equals("index.js")
                || path.endsWith("/index.js"))) {
            return 1;
        }

        // Source files
        if (!isExample && !isTest
                && (path.contains("/src/")
                || path.startsWith("src/"))) {
            return 1;
        }

        // Other implementation files
        if (!isExample && !isTest) {
            return 2;
        }

        // Examples
        if (isExample) {
            return 5;
        }

        // Tests
        if (isTest) {
            return 7;
        }

        // Documentation
        if (path.endsWith(".md")
                || path.contains("readme")
                || path.contains("changelog")
                || path.contains("history")) {
            return 9;
        }

        return 3;
    }
}