package devPilot.backend.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import devPilot.backend.service.ChatService;

@RestController
@RequestMapping("/api/repositories")
public class RepositoryChatController {

    private final ChatService chatService;

    public RepositoryChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/{id}/chat")
    public ChatResponse chatWithRepository(
            @PathVariable Long id,
            @RequestBody ChatRequest request) {

        String answer = chatService.chatWithRepository(
                id,
                request.message()
        );

        return new ChatResponse(answer);
    }

    public record ChatRequest(String message) {
    }

    public record ChatResponse(String answer) {
    }
}