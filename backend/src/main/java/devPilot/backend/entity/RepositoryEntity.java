package devPilot.backend.entity;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "repositories")
public class RepositoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String owner;

    @Column(nullable = false, unique = true, length = 2048)
    private String url;

    @Column(name = "default_branch")
    private String defaultBranch;

    @Column(name = "local_path", nullable = false, length = 2048)
    private String localPath;

    @Column(nullable = false)
    private String status;

    @Column(name = "total_files")
    private Integer totalFiles = 0;

    @Column(name = "source_files")
    private Integer sourceFiles = 0;

    @Column(name = "imported_at", nullable = false)
    private Instant importedAt;

    // DevPilot account that imported this repository
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private UserEntity user;

    public RepositoryEntity() {
    }

    @PrePersist
    protected void onCreate() {
        if (importedAt == null) {
            importedAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getDefaultBranch() {
        return defaultBranch;
    }

    public void setDefaultBranch(String defaultBranch) {
        this.defaultBranch = defaultBranch;
    }

    public String getLocalPath() {
        return localPath;
    }

    public void setLocalPath(String localPath) {
        this.localPath = localPath;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getTotalFiles() {
        return totalFiles;
    }

    public void setTotalFiles(Integer totalFiles) {
        this.totalFiles = totalFiles;
    }

    public Integer getSourceFiles() {
        return sourceFiles;
    }

    public void setSourceFiles(Integer sourceFiles) {
        this.sourceFiles = sourceFiles;
    }

    public Instant getImportedAt() {
        return importedAt;
    }

    public void setImportedAt(Instant importedAt) {
        this.importedAt = importedAt;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }
}
