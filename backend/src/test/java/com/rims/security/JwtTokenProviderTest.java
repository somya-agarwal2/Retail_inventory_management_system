package com.rims.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "c2VjdXJlX2VudGVycHJpc2Vfand0X3NlY3JldF9rZXlfZm9yX3JpbXNfc3ByaW5nX2Jvb3RfMjAyNg==");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationInMs", 3600000L); // 1 hour
    }

    @Test
    @DisplayName("Scenario 1: Generate valid JWT and parse claims correctly")
    void testGenerateAndValidateToken() {
        UserPrincipal principal = UserPrincipal.builder()
                .id(1L)
                .username("admin_user")
                .password("encoded_password")
                .email("admin@rims.com")
                .role("ROLE_ADMIN")
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .active(true)
                .build();

        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        String token = jwtTokenProvider.generateToken(auth);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("admin_user", jwtTokenProvider.getUsernameFromJwt(token));
    }

    @Test
    @DisplayName("Scenario 2: Reject malformed or invalid JWT")
    void testInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalid.jwt.token.string"));
    }
}
