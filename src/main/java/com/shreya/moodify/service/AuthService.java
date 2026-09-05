package com.shreya.moodify.service;
import com.shreya.moodify.dto.ApiDtos.*;
import com.shreya.moodify.entity.User;
import com.shreya.moodify.exception.ApiExceptions.BadRequest;
import com.shreya.moodify.repository.UserRepository;
import com.shreya.moodify.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository u, PasswordEncoder e, JwtService j) {
        this.users = u;
        this.encoder = e;
        this.jwt = j;
    }

    public AuthResponse register(RegisterRequest r) {
        if (users.findByEmailIgnoreCase(r.email()).isPresent()) {
            throw new BadRequest("Email already registered");
        }
        User u = new User();
        u.setName(r.name());
        u.setEmail(r.email().toLowerCase().trim());
        u.setPassword(encoder.encode(r.password()));
        u.setPreferredLanguage(r.preferredLanguage());
        users.save(u);
        return new AuthResponse(jwt.create(u.getEmail()), view(u));
    }

    public AuthResponse login(LoginRequest r) {
        User u = users.findByEmailIgnoreCase(r.email().trim())
                .orElseThrow(() -> new BadRequest("Invalid credentials"));
        if (!encoder.matches(r.password(), u.getPassword())) {
            throw new BadRequest("Invalid credentials");
        }
        return new AuthResponse(jwt.create(u.getEmail()), view(u));
    }

    @Transactional(readOnly = true)
    public UserView view(User u) {
        return new UserView(u.getId(), u.getName(), u.getEmail(), u.getProfileImage(), u.getPreferredLanguage());
    }
}
