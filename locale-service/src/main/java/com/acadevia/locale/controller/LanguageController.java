package com.acadevia.locale.controller;

import com.acadevia.locale.dto.request.CreateLanguageRequest;
import com.acadevia.locale.dto.response.LanguageDetailResponse;
import com.acadevia.locale.dto.response.LanguageResponse;
import com.acadevia.locale.dto.response.TranslationStatsResponse;
import com.acadevia.locale.service.LanguageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/languages")
@RequiredArgsConstructor
@Tag(name = "Language Management", description = "APIs for managing supported languages")
public class LanguageController {

    private final LanguageService languageService;

    @GetMapping
    @Operation(summary = "Get active languages", description = "Returns a list of all active languages supported by the platform")
    public ResponseEntity<List<LanguageResponse>> getActiveLanguages() {
        return ResponseEntity.ok(languageService.getActiveLanguages());
    }

    @GetMapping("/all")
    @Operation(summary = "Get all languages", description = "Returns administrative list of all languages including inactive ones")
    public ResponseEntity<List<LanguageResponse>> getAllLanguages() {
        return ResponseEntity.ok(languageService.getAllLanguages());
    }

    @GetMapping("/{code}")
    @Operation(summary = "Get language details", description = "Returns detailed information about a specific language including stats")
    public ResponseEntity<LanguageDetailResponse> getLanguageDetail(@PathVariable String code) {
        return ResponseEntity.ok(languageService.getLanguageDetail(code));
    }

    @PostMapping
    @Operation(summary = "Add new language", description = "Registers a new language in the system")
    public ResponseEntity<LanguageResponse> createLanguage(@Valid @RequestBody CreateLanguageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(languageService.createLanguage(request));
    }

    @PatchMapping("/{code}/toggle")
    @Operation(summary = "Toggle language status", description = "Activate or deactivate a language")
    public ResponseEntity<LanguageResponse> toggleLanguage(
            @PathVariable String code,
            @RequestParam Boolean isActive) {
        return ResponseEntity.ok(languageService.toggleLanguage(code, isActive));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get translation statistics", description = "Returns global translation completion statistics")
    public ResponseEntity<TranslationStatsResponse> getStats() {
        return ResponseEntity.ok(languageService.getStats());
    }

    @GetMapping("/state/{stateCode}")
    @Operation(summary = "Get default language for state", description = "Resolves the primary default language for a given state")
    public ResponseEntity<String> getDefaultLanguageForState(@PathVariable String stateCode) {
        return ResponseEntity.ok(languageService.getDefaultLanguageForState(stateCode));
    }
}
