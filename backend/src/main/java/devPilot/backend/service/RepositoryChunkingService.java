package devPilot.backend.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class RepositoryChunkingService {

    private static final int MAX_LINES_PER_CHUNK = 120;
    private static final int OVERLAP_LINES = 15;

    public List<CodeChunk> chunkRepository(
            Path repositoryPath,
            List<String> files) throws IOException {

        List<CodeChunk> chunks = new ArrayList<>();

        for (String relativeFilePath : files) {

            Path filePath = repositoryPath
                    .resolve(relativeFilePath)
                    .normalize();

            // Prevent paths from escaping the repository directory
            if (!filePath.startsWith(repositoryPath.normalize())) {
                continue;
            }

            if (!Files.isRegularFile(filePath)) {
                continue;
            }

            List<String> lines = Files.readAllLines(
                    filePath,
                    StandardCharsets.UTF_8
            );

            if (lines.isEmpty()) {
                continue;
            }

            chunks.addAll(chunkFile(relativeFilePath, lines));
        }

        return chunks;
    }

    private List<CodeChunk> chunkFile(
            String filePath,
            List<String> lines) {

        List<CodeChunk> chunks = new ArrayList<>();

        int startLine = 0;
        int chunkIndex = 0;

        while (startLine < lines.size()) {

            int endLine = Math.min(
                    startLine + MAX_LINES_PER_CHUNK,
                    lines.size()
            );

            List<String> chunkLines = lines.subList(
                    startLine,
                    endLine
            );

            String content = String.join("\n", chunkLines);

            chunks.add(new CodeChunk(
                    filePath,
                    chunkIndex,
                    startLine + 1,
                    endLine,
                    content
            ));

            chunkIndex++;

            if (endLine == lines.size()) {
                break;
            }

            startLine = endLine - OVERLAP_LINES;
        }

        return chunks;
    }

    public record CodeChunk(
            String filePath,
            int chunkIndex,
            int startLine,
            int endLine,
            String content
    ) {
    }
}