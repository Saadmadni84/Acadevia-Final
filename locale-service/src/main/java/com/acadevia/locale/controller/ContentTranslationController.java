package com.acadevia.locale.controller;

import com.acadevia.locale.dto.request.ContentTranslationRequest;
import com.acadevia.locale.dto.response.ContentTranslationResponse;
import com.acadevia.locale.enums.ContentType;
import com.acadevia.locale.service.ContentTranslationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/content-translations")
@RequiredArgsConstructor
@Tag(name = "Content Translation", description = "APIs for translating dynamic content (Courses, Quizzes, etc.)")
public class ContentTranslationController {

    private final ContentTranslationService contentTranslationService;

    @GetMapping("/{type}/{id}/{langCode}")
    @Operation(summary = "Get content translation", description = "Get translation for a specific content item")
    public ResponseEntity<ContentTranslationResponse> getContentTranslation(
            @PathVariable String type,
            @PathVariable Long id,
            @PathVariable String langCode) {
        
        ContentType contentType = ContentType.valueOf(type.toUpperCase());
        ContentTranslationResponse response = contentTranslationService.getContentTranslation(contentType, id, langCode);
        
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{type}/{id}")
    @Operation(summary = "Get all translations for content", description = "Get all available translations for a content item")
    public ResponseEntity<List<ContentTranslationResponse>> getAllTranslationsForContent(
            @PathVariable String type,
            @PathVariable Long id) {
        
        ContentType contentType = ContentType.valueOf(type.toUpperCase());
        return ResponseEntity.ok(contentTranslationService.getAllTranslationsForContent(contentType, id));
    }

    @PostMapping
    @Operation(summary = "Create/Update content translation", description = "Add or update translation for a content item")
    public ResponseEntity<ContentTranslationResponse> createOrUpdateContentTranslation(
            @Valid @RequestBody ContentTranslationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contentTranslationService.createOrUpdateContentTranslation(request));
    }
}
