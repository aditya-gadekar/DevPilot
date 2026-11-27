
package devPilot.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import devPilot.backend.entity.CodeChunk;
import devPilot.backend.service.CodeSearchService;

@RestController
@RequestMapping("/api/search")
public class SemanticSearchController {

    private final CodeSearchService codeSearchService;

    public SemanticSearchController(CodeSearchService codeSearchService) {
        this.codeSearchService = codeSearchService;
    }

    @PostMapping
    public List<Map<String, Object>> search(
            @RequestBody Map<String, Object> request) {

        Long repositoryId = Long.valueOf(
                request.get("repositoryId").toString()
        );

        String query = request.get("query").toString();

        int limit = request.get("limit") != null
                ? Integer.parseInt(request.get("limit").toString())
                : 10;

        List<CodeChunk> chunks =
                codeSearchService.search(repositoryId, query, limit);

        return chunks.stream()
                .map(chunk -> Map.<String, Object>of(
                        "filePath", chunk.getFilePath(),
                        "startLine", chunk.getStartLine(),
                        "endLine", chunk.getEndLine(),
                        "content", chunk.getContent()
                ))
                .toList();
    }
}
