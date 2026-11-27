package devPilot.backend.service;

public record RepositorySource(
        String filePath,
        int startLine,
        int endLine
) {
}