package com.acadevia.gamification.service;

import com.acadevia.gamification.entity.CreditTransaction;
import com.acadevia.gamification.entity.UserGamificationSummary;
import com.acadevia.gamification.entity.WalletTransaction;
import com.acadevia.gamification.repository.CreditTransactionRepository;
import com.acadevia.gamification.repository.UserGamificationSummaryRepository;
import com.acadevia.gamification.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final CreditTransactionRepository creditRepository;
    private final WalletTransactionRepository walletRepository;
    private final UserGamificationSummaryRepository summaryRepository;

    @Transactional
    public void addCredits(String userId, int amount, String source, String refId) {
        CreditTransaction tx = CreditTransaction.builder()
                .userId(userId)
                .amount(amount)
                .transactionType(amount >= 0 ? "EARN" : "SPEND")
                .source(source)
                .referenceId(refId)
                .build();
        creditRepository.save(tx);

        UserGamificationSummary summary = summaryRepository.findById(userId)
                .orElse(UserGamificationSummary.builder().userId(userId).build());
        summary.setTotalCredits(summary.getTotalCredits() + amount);
        summaryRepository.save(summary);
        
        log.info("Credits updated for user {}: {}", userId, amount);
    }

    @Transactional
    public void processWalletTransaction(String userId, BigDecimal amount, String type, String currency) {
        WalletTransaction tx = WalletTransaction.builder()
                .userId(userId)
                .amount(amount)
                .transactionType(type)
                .currencyCode(currency)
                .status("COMPLETED") // In real app, might be PENDING first
                .build();
        walletRepository.save(tx);

        UserGamificationSummary summary = summaryRepository.findById(userId)
                .orElse(UserGamificationSummary.builder().userId(userId).build());
        
        if ("DEPOSIT".equals(type) || "EARN".equals(type)) {
            summary.setWalletBalance(summary.getWalletBalance().add(amount));
        } else if ("WITHDRAWAL".equals(type) || "SPEND".equals(type)) {
            summary.setWalletBalance(summary.getWalletBalance().subtract(amount));
        }
        
        summaryRepository.save(summary);
        log.info("Wallet balance updated for user {}: {}", userId, amount);
    }
}
