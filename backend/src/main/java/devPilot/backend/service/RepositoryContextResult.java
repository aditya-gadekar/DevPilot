package devPilot.backend.service;

import java.util.List;

public record RepositoryContextResult(
        String context,
        List<RepositorySource> sources
) {
}