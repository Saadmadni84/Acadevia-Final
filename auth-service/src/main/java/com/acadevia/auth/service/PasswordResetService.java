package com.acadevia.auth.service;

import com.acadevia.auth.entity.PasswordResetToken;
import com.acadevia.auth.entity.User;
import com.acadevia.auth.exception.TokenExpiredException;
import com.acadevia.auth.exception.TokenInvalidException;
import com.acadevia.auth.repository.PasswordResetTokenRepository;
import com.acadevia.auth.util.AppConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;

    @Transactional
    public PasswordResetToken createResetToken(User user) {
        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plusHours(AppConstants.PASSWORD_RESET_TOKEN_EXPIRY_HOURS))
                .isUsed(false)
                .build();
        return tokenRepository.save(token);
    }

    public PasswordResetToken validateResetToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenInvalidException("Reset token not found"));
        
        if (resetToken.getIsUsed()) {
            throw new TokenInvalidException("Reset token has already been used");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new TokenExpiredException("Reset token has expired");
        }

        return resetToken;
    }

    @Transactional
    public void markTokenAsUsed(PasswordResetToken token) {
        token.setIsUsed(true);
        tokenRepository.save(token);
    }

    @Scheduled(cron = "0 0 4 * * *") // Every day at 4 AM
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
