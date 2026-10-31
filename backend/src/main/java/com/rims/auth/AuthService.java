package com.rims.auth;

import com.rims.security.JwtTokenProvider;
import com.rims.security.UserPrincipal;
import com.rims.user.User;
import com.rims.user.UserDto;
import com.rims.user.UserRepository;
import com.rims.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final UserService userService;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId()).orElseThrow();

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .expiresIn(86400)
                .user(UserDto.fromEntity(user))
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        UserDto userDto = UserDto.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(request.getPassword())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(request.getRole() != null ? request.getRole() : "INVENTORY_STAFF")
                .status("ACTIVE")
                .assignedLocationType(request.getAssignedLocationType())
                .assignedLocationId(request.getAssignedLocationId())
                .build();

        UserDto created = userService.createUser(userDto);
        return login(new LoginRequest(created.getUsername(), request.getPassword()));
    }

    public UserDto getCurrentUser(UserPrincipal principal) {
        return userService.getUserById(principal.getId());
    }
}
