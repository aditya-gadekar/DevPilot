package devPilot.backend.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;

@Service
public class GitHubZipService {

    private static final long MAX_DOWNLOAD_SIZE = 100L * 1024 * 1024;

    private final HttpClient httpClient;

    public GitHubZipService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(20))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public Path downloadRepository(String owner, String repository, String branch)
            throws IOException, InterruptedException {

        String encodedBranch = java.net.URLEncoder.encode(
                branch, java.nio.charset.StandardCharsets.UTF_8
        ).replace("+", "%20");

        String downloadUrl = "https://codeload.github.com/"
                + owner + "/" + repository
                + "/zip/refs/heads/" + encodedBranch;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(downloadUrl))
                .timeout(Duration.ofMinutes(2))
                .header("User-Agent", "DevPilot")
                .GET()
                .build();

        HttpResponse<InputStream> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofInputStream()
        );

        if (response.statusCode() != 200) {
            response.body().close();
            throw new IOException(
                    "GitHub ZIP download failed. HTTP status: "
                            + response.statusCode()
            );
        }

        Path tempFile = Files.createTempFile("devpilot-repo-", ".zip");

        try (InputStream inputStream = response.body();
             OutputStream outputStream = Files.newOutputStream(tempFile)) {

            byte[] buffer = new byte[8192];
            long totalBytes = 0;
            int bytesRead;

            while ((bytesRead = inputStream.read(buffer)) != -1) {

                totalBytes += bytesRead;

                if (totalBytes > MAX_DOWNLOAD_SIZE) {
                    throw new IOException(
                            "Repository ZIP exceeds the 100 MB download limit."
                    );
                }

                outputStream.write(buffer, 0, bytesRead);
            }

            if (totalBytes == 0) {
                throw new IOException("Downloaded repository ZIP is empty.");
            }

            return tempFile;

        } catch (Exception exception) {

            Files.deleteIfExists(tempFile);

            if (exception instanceof IOException ioException) {
                throw ioException;
            }

            throw new IOException("Failed to download GitHub repository.", exception);
        }
    }
}