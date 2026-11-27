package devPilot.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.springframework.stereotype.Service;

@Service
public class ZipExtractionService {

    private static final int MAX_FILES = 5000;

    private static final long MAX_TOTAL_SIZE =
            250L * 1024 * 1024;

    private static final long MAX_FILE_SIZE =
            50L * 1024 * 1024;

    public void extractZip(Path zipFile, Path destination)
            throws IOException {

        Files.createDirectories(destination);

        Path normalizedDestination = destination.toAbsolutePath().normalize();

        int extractedFiles = 0;
        long totalExtractedBytes = 0;

        try (InputStream inputStream = Files.newInputStream(zipFile);
             ZipInputStream zipInputStream =
                     new ZipInputStream(inputStream)) {

            ZipEntry entry;

            while ((entry = zipInputStream.getNextEntry()) != null) {

                String entryName = entry.getName();

                if (entryName == null || entryName.isBlank()) {
                    zipInputStream.closeEntry();
                    continue;
                }

                // Prevent ZIP path traversal attacks
                Path targetPath = normalizedDestination
                        .resolve(entryName)
                        .normalize();

                if (!targetPath.startsWith(normalizedDestination)) {
                    throw new IOException(
                            "Unsafe ZIP entry detected: " + entryName
                    );
                }

                if (entry.isDirectory()) {

                    Files.createDirectories(targetPath);

                } else {

                    extractedFiles++;

                    if (extractedFiles > MAX_FILES) {
                        throw new IOException(
                                "Repository contains too many files."
                        );
                    }

                    Path parent = targetPath.getParent();

                    if (parent != null) {
                        Files.createDirectories(parent);
                    }

                    long currentFileSize = 0;

                    try (var outputStream =
                                 Files.newOutputStream(targetPath)) {

                        byte[] buffer = new byte[8192];
                        int bytesRead;

                        while ((bytesRead =
                                zipInputStream.read(buffer)) != -1) {

                            currentFileSize += bytesRead;
                            totalExtractedBytes += bytesRead;

                            if (currentFileSize > MAX_FILE_SIZE) {
                                throw new IOException(
                                        "File exceeds the 50 MB limit: "
                                                + entryName
                                );
                            }

                            if (totalExtractedBytes > MAX_TOTAL_SIZE) {
                                throw new IOException(
                                        "Repository exceeds the 250 MB extraction limit."
                                );
                            }

                            outputStream.write(
                                    buffer, 0, bytesRead
                            );
                        }
                    }
                }

                zipInputStream.closeEntry();
            }
        }
    }
}