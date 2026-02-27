package com.acadevia.content.controller;

import com.acadevia.content.dto.request.SubtitleCreateRequest;
import com.acadevia.content.dto.request.SubtitleUpdateRequest;
import com.acadevia.content.dto.response.ApiResponse;
import com.acadevia.content.dto.response.SubtitleResponse;
import com.acadevia.content.service.SubtitleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content/subtitles")
@RequiredArgsConstructor
public class SubtitleController {

    private final SubtitleService subtitleService;

    @PostMapping
    public ResponseEntity<ApiResponse<SubtitleResponse>> createSubtitle(
            @Valid @RequestBody SubtitleCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(subtitleService.createSubtitle(request), "Subtitle created"));
    }

    @PutMapping("/{subtitleId}")
    public ResponseEntity<ApiResponse<SubtitleResponse>> updateSubtitle(
            @PathVariable Long subtitleId, @Valid @RequestBody SubtitleUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(subtitleService.updateSubtitle(subtitleId, request)));
    }

    @GetMapping("/video/{videoId}")
    public ResponseEntity<ApiResponse<List<SubtitleResponse>>> getSubtitlesByVideo(@PathVariable Long videoId) {
        return ResponseEntity.ok(ApiResponse.ok(subtitleService.getSubtitlesByVideoId(videoId)));
    }

    @GetMapping("/video/{videoId}/language/{languageCode}")
    public ResponseEntity<ApiResponse<SubtitleResponse>> getSubtitleByLanguage(
            @PathVariable Long videoId, @PathVariable String languageCode) {
        return ResponseEntity.ok(ApiResponse.ok(subtitleService.getSubtitleByVideoAndLanguage(videoId, languageCode)));
    }

    @PatchMapping("/video/{videoId}/default/{subtitleId}")
    public ResponseEntity<ApiResponse<Void>> setDefaultSubtitle(
            @PathVariable Long videoId, @PathVariable Long subtitleId) {
        subtitleService.setDefaultSubtitle(videoId, subtitleId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Default subtitle set"));
    }

    @DeleteMapping("/{subtitleId}")
    public ResponseEntity<ApiResponse<Void>> deleteSubtitle(@PathVariable Long subtitleId) {
        subtitleService.deleteSubtitle(subtitleId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Subtitle deleted"));
    }
}
