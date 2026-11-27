
package devPilot.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import devPilot.backend.dto.AuthResponse;
import devPilot.backend.dto.LoginRequest;
import devPilot.backend.dto.LoginResponse;
import devPilot.backend.dto.RegisterRequest;
import devPilot.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }
}
