package devPilot.backend.entity;
import java.time.OffsetDateTime;

import devPilot.backend.service.VectorUtils;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "code_chunks",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "unique_repository_file_chunk",
            columnNames = {"repository_id", "file_path", "chunk_index"}
        )
    }
)
public class CodeChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "repository_id", nullable = false)
    private Long repositoryId;

    @Column(name = "file_path", nullable = false, columnDefinition = "TEXT")
    private String filePath;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(name = "start_line", nullable = false)
    private Integer startLine;

    @Column(name = "end_line", nullable = false)
    private Integer endLine;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "embedding", columnDefinition = "vector(768)")
    private String embedding;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }

    public CodeChunk() {
    }

    public CodeChunk(
            Long repositoryId,
            String filePath,
            Integer chunkIndex,
            Integer startLine,
            Integer endLine,
            String content
    ) {
        this.repositoryId = repositoryId;
        this.filePath = filePath;
        this.chunkIndex = chunkIndex;
        this.startLine = startLine;
        this.endLine = endLine;
        this.content = content;
    }

    public Long getId() {
        return id;
    }

    public Long getRepositoryId() {
        return repositoryId;
    }

    public String getFilePath() {
        return filePath;
    }

    public Integer getChunkIndex() {
        return chunkIndex;
    }

    public Integer getStartLine() {
        return startLine;
    }

    public Integer getEndLine() {
        return endLine;
    }

    public String getContent() {
        return content;
    }

    public String getEmbedding() {
        return embedding;
    }

    public void setEmbedding(float[] vector) {
        this.embedding = VectorUtils.toVectorString(vector);
    }

    public void setEmbedding(String embedding) {
        this.embedding = embedding;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}