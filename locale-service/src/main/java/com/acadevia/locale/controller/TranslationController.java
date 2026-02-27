package com.acadevia.locale.controller;

import com.acadevia.locale.dto.request.BulkTranslationRequest;
import com.acadevia.locale.dto.request.CreateTranslationRequest;
import com.acadevia.locale.dto.response.LanguagePackResponse;
import com.acadevia.locale.dto.response.MissingTranslationsResponse;
import com.acadevia.locale.dto.response.TranslationBundleResponse;
import com.acadevia.locale.service.LanguagePackService;
import com.acadevia.locale.service.TranslationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/translations")
@RequiredArgsConstructor
@Tag(name = "Translation Management", description = "APIs for managing and retrieving translations")
public class TranslationController {

    private final TranslationService translationService;
    private final LanguagePackService languagePackService;

    @GetMapping("/resolve")
    @Operation(summary = "Resolve single key", description = "Resolves a specific translation key with fallback logic")
    public ResponseEntity<String> resolveTranslation(
            @RequestParam String key,
            @RequestParam(required = false) String lang,
            @RequestParam(required = false) String state,
            @RequestParam Map<String, String> allParams) {
        
        // Remove known params to leave only variables
        allParams.remove("key");
        allParams.remove("lang");
        allParams.remove("state");
        
        return ResponseEntity.ok(translationService.getTranslation(key, lang, state, allParams));
    }

    @GetMapping("/bundle/{langCode}")
    @Operation(summary = "Get translation bundle", description = "Get all translations for a language (flat structure)")
    public ResponseEntity<TranslationBundleResponse> getBundle(@PathVariable String langCode) {
        return ResponseEntity.ok(translationService.getTranslationBundle(langCode));
    }

    @GetMapping("/bundle/{langCode}/{category}")
    @Operation(summary = "Get category bundle", description = "Get translations for a specific category")
    public ResponseEntity<TranslationBundleResponse> getBundleByCategory(
            @PathVariable String langCode,
            @PathVariable String category) {
        return ResponseEntity.ok(translationService.getTranslationBundleByCategory(langCode, category));
    }

    @GetMapping("/pack/{langCode}")
    @Operation(summary = "Get full language pack", description = "Get hierarchical language pack for frontend client initialization")
    public ResponseEntity<LanguagePackResponse> getLanguagePack(@PathVariable String langCode) {
        return ResponseEntity.ok(languagePackService.getLanguagePack(langCode));
    }

    @PostMapping
    @Operation(summary = "Create/Update translation", description = "Add or update a single translation value")
    public ResponseEntity<Void> createTranslation(@Valid @RequestBody CreateTranslationRequest request) {
        translationService.createOrUpdateTranslation(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/bulk")
    @Operation(summary = "Bulk upsert translations", description = "Add or update multiple translations for a language")
    public ResponseEntity<Void> bulkCreateTranslations(@Valid @RequestBody BulkTranslationRequest request) {
        translationService.bulkCreateTranslations(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/missing/{langCode}")
    @Operation(summary = "Get missing translations", description = "List all keys that have not been translated for a language")
    public ResponseEntity<MissingTranslationsResponse> getMissingTranslations(@PathVariable String langCode) {
        return ResponseEntity.ok(translationService.getMissingTranslations(langCode));
    }
}
