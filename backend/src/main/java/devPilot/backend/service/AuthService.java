
package devPilot.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import devPilot.backend.dto.AuthResponse;
import devPilot.backend.dto.LoginRequest;
import devPilot.backend.dto.LoginResponse;
import devPilot.backend.dto.RegisterRequest;
import devPilot.backend.entity.UserEntity;
import devPilot.backend.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // REGISTER USER
    public AuthResponse register(RegisterRequest request) {

        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (request.getPassword() == null
                || request.getPassword().length() < 8) {

            throw new IllegalArgumentException(
                    "Password must contain at least 8 characters");
        }

        String normalizedEmail =
                request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "Email is already registered");
        }

        String encodedPassword =
                passwordEncoder.encode(request.getPassword());

        UserEntity user = new UserEntity(
                request.getName().trim(),
                normalizedEmail,
                encodedPassword
        );

        UserEntity savedUser = userRepository.save(user);

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                "Registration successful"
        );
    }

    // LOGIN USER
    public LoginResponse login(LoginRequest request) {

        if (request.getEmail() == null
                || request.getEmail().isBlank()) {

            throw new IllegalArgumentException("Email is required");
        }

        if (request.getPassword() == null
                || request.getPassword().isBlank()) {

            throw new IllegalArgumentException("Password is required");
        }

        String normalizedEmail =
                request.getEmail().trim().toLowerCase();

        UserEntity user = userRepository
                .findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                token,
                "Login successful"
        );
    }
}
