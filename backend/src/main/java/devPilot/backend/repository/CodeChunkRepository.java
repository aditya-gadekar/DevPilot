package devPilot.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import devPilot.backend.entity.CodeChunk;

public interface CodeChunkRepository extends JpaRepository<CodeChunk, Long> {

    List<CodeChunk> findByRepositoryId(Long repositoryId);

    long countByRepositoryId(Long repositoryId);

    void deleteByRepositoryId(Long repositoryId);
}