package devPilot.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

@Service
public class RepositoryScannerService {

    private static final Set<String> SUPPORTED_EXTENSIONS = Set.of(
            ".java", ".js", ".jsx", ".ts", ".tsx",
            ".py", ".c", ".cpp", ".h",
            ".html", ".css", ".json", ".xml",
            ".yml", ".yaml", ".md", ".txt"
    );

    private static final Set<String> IGNORED_DIRECTORIES = Set.of(
            ".git",
            "node_modules",
            "target",
            "build",
            "dist",
            ".next",
            ".cache",
            "cache",
            "venv",
            ".venv"
    );

    public ScanResult scanRepository(Path repositoryPath)
            throws IOException {

        List<String> files = new ArrayList<>();

        int totalFiles = 0;
        int sourceFiles = 0;

        try (Stream<Path> paths = Files.walk(repositoryPath)) {

            for (Path path : paths.toList()) {

                if (!Files.isRegularFile(path)) {
                    continue;
                }

                if (isInsideIgnoredDirectory(repositoryPath, path)) {
                    continue;
                }

                totalFiles++;

                if (isSupportedFile(path)) {

                    sourceFiles++;

                    String relativePath = repositoryPath
                            .relativize(path)
                            .toString()
                            .replace("\\", "/");

                    files.add(relativePath);
                }
            }
        }

        return new ScanResult(totalFiles, sourceFiles, files);
    }

    private boolean isSupportedFile(Path path) {

        String fileName = path.getFileName()
                .toString()
                .toLowerCase();

        for (String extension : SUPPORTED_EXTENSIONS) {

            if (fileName.endsWith(extension)) {
                return true;
            }
        }

        return false;
    }

    private boolean isInsideIgnoredDirectory(
            Path repositoryPath,
            Path filePath) {

        Path relativePath = repositoryPath.relativize(filePath);

        for (Path part : relativePath) {

            String directoryName = part.toString();

            if (IGNORED_DIRECTORIES.contains(directoryName)) {
                return true;
            }
        }

        return false;
    }

    public record ScanResult(
            int totalFiles,
            int sourceFiles,
            List<String> files
    ) {
    }
}