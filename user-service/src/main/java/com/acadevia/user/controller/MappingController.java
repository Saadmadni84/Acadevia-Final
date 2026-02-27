package com.acadevia.user.controller;

import com.acadevia.user.dto.TeacherMappingDto;
import com.acadevia.user.service.MappingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mappings")
@RequiredArgsConstructor
public class MappingController {

    private final MappingService mappingService;

    @PostMapping("/teachers")
    public ResponseEntity<TeacherMappingDto> addTeacherToSchool(
            @Valid @RequestBody TeacherMappingDto mappingDto) {
        return new ResponseEntity<>(mappingService.addTeacherToSchool(mappingDto), HttpStatus.CREATED);
    }

    @GetMapping("/schools/{schoolId}/teachers")
    public ResponseEntity<List<TeacherMappingDto>> getTeachersBySchool(@PathVariable Long schoolId) {
        return ResponseEntity.ok(mappingService.getTeachersBySchool(schoolId));
    }

    // TODO: Add Teacher Classroom Mapping endpoints (assignTeacherToClassroom)
    // TODO: Add Student Enrollment endpoints (enrollStudent)
}
