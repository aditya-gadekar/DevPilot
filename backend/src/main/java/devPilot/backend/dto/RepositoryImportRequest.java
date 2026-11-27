package devPilot.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RepositoryImportRequest {

    @NotBlank(message = "GitHub repository URL is required")
    @Size(max = 2048, message = "Repository URL is too long")
    private String url;

    public RepositoryImportRequest() {
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}