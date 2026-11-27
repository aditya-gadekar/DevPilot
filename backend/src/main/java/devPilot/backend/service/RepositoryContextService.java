package devPilot.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import devPilot.backend.entity.CodeChunk;

@Service
public class RepositoryContextService {

    private final CodeSearchService codeSearchService;

    public RepositoryContextService(CodeSearchService codeSearchService) {
        this.codeSearchService = codeSearchService;
    }

    public RepositoryContextResult buildRepositoryContext(
            Long repositoryId,
            String query) {

        List<CodeChunk> chunks =
                codeSearchService.search(repositoryId, query, 5);

        if (chunks.isEmpty()) {
            return new RepositoryContextResult(
                    "No relevant code found in this repository.",
                    List.of()
            );
        }

        StringBuilder context = new StringBuilder();
        List<RepositorySource> sources = new ArrayList<>();

        for (CodeChunk chunk : chunks) {

            context.append("\n\n--- SOURCE CODE ---\n");

            context.append("File: ")
                    .append(chunk.getFilePath())
                    .append("\n");

            context.append("Lines: ")
                    .append(chunk.getStartLine())
                    .append("-")
                    .append(chunk.getEndLine())
                    .append("\n\n");

            context.append(chunk.getContent());

            // Collect source references
            RepositorySource source = new RepositorySource(
                    chunk.getFilePath(),
                    chunk.getStartLine(),
                    chunk.getEndLine()
            );

            if (!sources.contains(source)) {
                sources.add(source);
            }
        }

        return new RepositoryContextResult(
                context.toString(),
                sources
        );
    }

    // Maintains compatibility with the existing method
    public String buildContext(Long repositoryId, String query) {

        return buildRepositoryContext(repositoryId, query)
                .context();
    }
}