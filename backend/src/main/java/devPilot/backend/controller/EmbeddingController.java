package devPilot.backend.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import devPilot.backend.service.EmbeddingService;

@RestController
@RequestMapping("/api/embeddings")
public class EmbeddingController {

    private final EmbeddingService embeddingService;

    public EmbeddingController(EmbeddingService embeddingService) {
        this.embeddingService = embeddingService;
    }

    @PostMapping("/generate")
    public Map<String, Object> generateEmbedding(
            @RequestBody Map<String, String> request) {

        String text = request.get("text");

        float[] embedding = embeddingService.generateEmbedding(text);

        return Map.of(
                "success", true,
                "dimensions", embedding.length,
                "embedding", embedding
        );
    }
}