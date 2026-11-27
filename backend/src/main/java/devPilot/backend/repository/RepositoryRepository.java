
package devPilot.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import devPilot.backend.entity.RepositoryEntity;
import devPilot.backend.entity.UserEntity;

public interface RepositoryRepository extends JpaRepository<RepositoryEntity, Long> {

    Optional<RepositoryEntity> findByUrl(String url);

    boolean existsByUrl(String url);

    // User-specific repository queries
    List<RepositoryEntity> findByUser(UserEntity user);

    Optional<RepositoryEntity> findByIdAndUser(Long id, UserEntity user);

    boolean existsByUrlAndUser(String url, UserEntity user);
}
