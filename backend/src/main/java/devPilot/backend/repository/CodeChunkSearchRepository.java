package devPilot.backend.repository;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import devPilot.backend.entity.CodeChunk;
import devPilot.backend.service.VectorUtils;

@Repository
public class CodeChunkSearchRepository {

    private final JdbcTemplate jdbcTemplate;

    public CodeChunkSearchRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<CodeChunk> searchSimilarChunks(
            Long repositoryId,
            float[] queryEmbedding,
            int limit) {

        String vector = VectorUtils.toVectorString(queryEmbedding);

        String sql = """
                SELECT
                    repository_id,
                    file_path,
                    chunk_index,
                    start_line,
                    end_line,
                    content
                FROM code_chunks
                WHERE repository_id = ?
                ORDER BY
                    CASE
                        WHEN file_path LIKE '%/examples/%'
                             OR file_path LIKE 'examples/%'
                        THEN 2

                        WHEN file_path LIKE '%/test/%'
                             OR file_path LIKE '%/tests/%'
                             OR file_path LIKE 'test/%'
                             OR file_path LIKE 'tests/%'
                        THEN 3

                        WHEN file_path LIKE '%/lib/%'
                             OR file_path LIKE 'lib/%'
                        THEN 0

                        WHEN file_path LIKE '%/src/%'
                             OR file_path LIKE 'src/%'
                        THEN 0

                        ELSE 1
                    END,
                    embedding <=> ?::vector
                LIMIT ?
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new CodeChunk(
                        rs.getLong("repository_id"),
                        rs.getString("file_path"),
                        rs.getInt("chunk_index"),
                        rs.getInt("start_line"),
                        rs.getInt("end_line"),
                        rs.getString("content")
                ),
                repositoryId,
                vector,
                limit
        );
    }
}