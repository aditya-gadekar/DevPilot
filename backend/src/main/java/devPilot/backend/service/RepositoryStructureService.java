
package devPilot.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import devPilot.backend.entity.RepositoryEntity;

@Service
public class RepositoryStructureService {

    private final RepositoryScannerService repositoryScannerService;

    public RepositoryStructureService(
            RepositoryScannerService repositoryScannerService) {

        this.repositoryScannerService = repositoryScannerService;
    }

    public Map<String, Object> getRepositoryStructure(
            RepositoryEntity repository) throws IOException {

        Path repositoryPath = Path.of(repository.getLocalPath());

        RepositoryScannerService.ScanResult scanResult =
                repositoryScannerService.scanRepository(repositoryPath);

        Map<String, Integer> extensionCounts = new LinkedHashMap<>();

        for (String file : scanResult.files()) {

            String extension = getExtension(file);

            extensionCounts.merge(extension, 1, Integer::sum);
        }

        // Find the actual project root inside the extracted ZIP
        Path projectRoot = findProjectRoot(repositoryPath);

        boolean readmeExists =
                Files.exists(projectRoot.resolve("README.md"))
                || Files.exists(projectRoot.resolve("README"))
                || Files.exists(projectRoot.resolve("README.txt"));

        Map<String, Boolean> configurationFiles = new LinkedHashMap<>();

        configurationFiles.put("pom.xml",
                Files.exists(projectRoot.resolve("pom.xml")));

        configurationFiles.put("package.json",
                Files.exists(projectRoot.resolve("package.json")));

        configurationFiles.put("build.gradle",
                Files.exists(projectRoot.resolve("build.gradle")));

        configurationFiles.put("requirements.txt",
                Files.exists(projectRoot.resolve("requirements.txt")));

        configurationFiles.put("Dockerfile",
                Files.exists(projectRoot.resolve("Dockerfile")));

        configurationFiles.put("docker-compose.yml",
                Files.exists(projectRoot.resolve("docker-compose.yml")));

        configurationFiles.put("docker-compose.yaml",
                Files.exists(projectRoot.resolve("docker-compose.yaml")));

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("id", repository.getId());
        result.put("name", repository.getName());
        result.put("owner", repository.getOwner());
        result.put("url", repository.getUrl());
        result.put("defaultBranch", repository.getDefaultBranch());
        result.put("status", repository.getStatus());

        result.put("totalFiles", scanResult.totalFiles());
        result.put("sourceFiles", scanResult.sourceFiles());

        result.put("extensionCounts", extensionCounts);
        result.put("readmeExists", readmeExists);
        result.put("projectRoot", projectRoot.toString());
        result.put("configurationFiles", configurationFiles);

        result.put("files", scanResult.files());

        return result;
    }

    private Path findProjectRoot(Path repositoryPath) throws IOException {

        // If project files exist directly in the repository root
        if (containsProjectFiles(repositoryPath)) {
            return repositoryPath;
        }

        // Check the first-level folders inside the ZIP extraction directory
        try (Stream<Path> paths = Files.list(repositoryPath)) {

            return paths
                    .filter(Files::isDirectory)
                    .filter(this::containsProjectFiles)
                    .findFirst()
                    .orElse(repositoryPath);
        }
    }

    private boolean containsProjectFiles(Path path) {

        return Files.exists(path.resolve("README.md"))
                || Files.exists(path.resolve("README"))
                || Files.exists(path.resolve("README.txt"))
                || Files.exists(path.resolve("pom.xml"))
                || Files.exists(path.resolve("package.json"))
                || Files.exists(path.resolve("build.gradle"))
                || Files.exists(path.resolve("requirements.txt"));
    }

    private String getExtension(String fileName) {

        int lastDot = fileName.lastIndexOf('.');

        if (lastDot == -1 || lastDot == fileName.length() - 1) {
            return "[no extension]";
        }

        return fileName.substring(lastDot).toLowerCase();
    }
}
