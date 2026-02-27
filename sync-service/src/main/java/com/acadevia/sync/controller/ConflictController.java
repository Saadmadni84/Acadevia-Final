package com.acadevia.sync.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/conflicts")
@RequiredArgsConstructor
@Tag(name = "Conflict Management", description = "APIs for resolving data conflicts")
public class ConflictController {

    @GetMapping
    public ResponseEntity<String> getConflicts() {
        return ResponseEntity.ok("Conflict list placeholder");
    }
}
