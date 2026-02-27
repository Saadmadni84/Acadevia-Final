package com.acadevia.user.controller;

import com.acadevia.user.dto.SchoolDto;
import com.acadevia.user.service.SchoolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolService schoolService;

    @PostMapping
    public ResponseEntity<SchoolDto> createSchool(@Valid @RequestBody SchoolDto schoolDto) {
        return new ResponseEntity<>(schoolService.createSchool(schoolDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SchoolDto> updateSchool(
            @PathVariable Long id,
            @Valid @RequestBody SchoolDto schoolDto) {
        return ResponseEntity.ok(schoolService.updateSchool(id, schoolDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SchoolDto> getSchoolById(@PathVariable Long id) {
        return ResponseEntity.ok(schoolService.getSchoolById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<SchoolDto> getSchoolByCode(@PathVariable String code) {
        return ResponseEntity.ok(schoolService.getSchoolByCode(code));
    }

    @GetMapping
    public ResponseEntity<Page<SchoolDto>> getAllSchools(
            @PageableDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(schoolService.getAllSchools(pageable));
    }

    @GetMapping("/city/{cityId}")
    public ResponseEntity<Page<SchoolDto>> getSchoolsByCity(
            @PathVariable Long cityId,
            @PageableDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(schoolService.getSchoolsByCity(cityId, pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<SchoolDto>> searchSchools(
            @RequestParam String query,
            @PageableDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(schoolService.searchSchools(query, pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchool(@PathVariable Long id) {
        schoolService.deleteSchool(id);
        return ResponseEntity.noContent().build();
    }
}
