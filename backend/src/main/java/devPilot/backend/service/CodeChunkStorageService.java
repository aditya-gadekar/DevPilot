package devPilot.backend.service;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import devPilot.backend.entity.CodeChunk;

@Service
public class CodeChunkStorageService {

    private final JdbcTemplate jdbcTemplate;
    private final EmbeddingService embeddingService;

    public CodeChunkStorageService(
            JdbcTemplate jdbcTemplate,
            EmbeddingService embeddingService
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.embeddingService = embeddingService;
    }

    @Transactional
    public void storeChunks(Long repositoryId, List<CodeChunk> chunks) {

        String sql = """
            INSERT INTO code_chunks (
                repository_id,
                file_path,
                chunk_index,
                start_line,
                end_line,
                content,
                embedding
            )
            VALUES (?, ?, ?, ?, ?, ?, ?::vector)
            ON CONFLICT (repository_id, file_path, chunk_index)
            DO UPDATE SET
                content = EXCLUDED.content,
                embedding = EXCLUDED.embedding
            """;

        for (CodeChunk chunk : chunks) {

            float[] embedding =
                    embeddingService.generateEmbedding(chunk.getContent());

            String vectorString =
                    VectorUtils.toVectorString(embedding);

            jdbcTemplate.update(
                    sql,
                    repositoryId,
                    chunk.getFilePath(),
                    chunk.getChunkIndex(),
                    chunk.getStartLine(),
                    chunk.getEndLine(),
                    chunk.getContent(),
                    vectorString
            );
        }
    }
}