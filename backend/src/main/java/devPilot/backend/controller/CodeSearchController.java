package devPilot.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import devPilot.backend.entity.CodeChunk;
import devPilot.backend.service.CodeSearchService;

@RestController
@RequestMapping("/api/repositories")
public class CodeSearchController {

    private final CodeSearchService codeSearchService;

    public CodeSearchController(CodeSearchService codeSearchService) {
        this.codeSearchService = codeSearchService;
    }

    @PostMapping("/{id}/search")
    public List<CodeChunk> searchRepository(
            @PathVariable Long id,
            @RequestBody SearchRequest request) {

        return codeSearchService.search(
                id,
                request.query(),
                request.limit() == null ? 5 : request.limit()
        );
    }

    public record SearchRequest(String query, Integer limit) {
    }
}