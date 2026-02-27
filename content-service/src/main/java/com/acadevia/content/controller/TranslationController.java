package com.acadevia.content.controller;

import com.acadevia.content.dto.request.TranslationCreateRequest;
import com.acadevia.content.dto.request.TranslationUpdateRequest;
import com.acadevia.content.dto.response.ApiResponse;
import com.acadevia.content.dto.response.TranslationResponse;
import com.acadevia.content.service.TranslationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content/translations")
@RequiredArgsConstructor
public class TranslationController {

    private final TranslationService translationService;

    @PostMapping
    public ResponseEntity<ApiResponse<TranslationResponse>> createTranslation(
            @Valid @RequestBody TranslationCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(translationService.createTranslation(request), "Translation created"));
    }

    @PutMapping("/{translationId}")
    public ResponseEntity<ApiResponse<TranslationResponse>> updateTranslation(
            @PathVariable Long translationId, @Valid @RequestBody TranslationUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(translationService.updateTranslation(translationId, request)));
    }

    @GetMapping("/content/{contentType}/{contentId}")
    public ResponseEntity<ApiResponse<List<TranslationResponse>>> getTranslations(
            @PathVariable String contentType, @PathVariable Long contentId) {
        return ResponseEntity.ok(ApiResponse.ok(translationService.getTranslationsByContent(contentType, contentId)));
    }

    @GetMapping("/content/{contentType}/{contentId}/language/{languageCode}")
    public ResponseEntity<ApiResponse<List<TranslationResponse>>> getTranslationsByLanguage(
            @PathVariable String contentType, @PathVariable Long contentId, @PathVariable String languageCode) {
        return ResponseEntity.ok(ApiResponse.ok(translationService.getTranslationsByContentAndLanguage(contentType, contentId, languageCode)));
    }

    @GetMapping("/content/{contentType}/{contentId}/languages")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableLanguages(
            @PathVariable String contentType, @PathVariable Long contentId) {
        return ResponseEntity.ok(ApiResponse.ok(translationService.getAvailableLanguages(contentType, contentId)));
    }

    @PatchMapping("/{translationId}/verify")
    public ResponseEntity<ApiResponse<TranslationResponse>> verifyTranslation(
            @PathVariable Long translationId, @RequestParam Long verifiedBy) {
        return ResponseEntity.ok(ApiResponse.ok(translationService.verifyTranslation(translationId, verifiedBy), "Translation verified"));
    }

    @DeleteMapping("/{translationId}")
    public ResponseEntity<ApiResponse<Void>> deleteTranslation(@PathVariable Long translationId) {
        translationService.deleteTranslation(translationId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Translation deleted"));
    }
}
