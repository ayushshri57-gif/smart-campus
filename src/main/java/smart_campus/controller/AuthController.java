package smart_campus.controller;

import org.springframework.web.bind.annotation.*;

import smart_campus.Service.AuthService;
import smart_campus.dto.LoginRequest;
import smart_campus.dto.LoginResponse;
import smart_campus.dto.RegisterRequest;
import smart_campus.entity.User;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}

