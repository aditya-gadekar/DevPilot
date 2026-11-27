
package devPilot.backend.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import devPilot.backend.dto.ChatRequest;
import devPilot.backend.dto.ChatResponse;
import devPilot.backend.service.ChatService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // General AI Chat
    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {

        String aiResponse = chatService.chat(request.message());

        return new ChatResponse(aiResponse);
    }

    // Repository-aware AI Chat (RAG)
    @PostMapping("/repositories/{id}")
    public ChatResponse chatWithRepository(
            @PathVariable Long id,
            @Valid @RequestBody ChatRequest request) {

        String aiResponse = chatService.chatWithRepository(
                id,
                request.message()
        );

        return new ChatResponse(aiResponse);
    }
}
