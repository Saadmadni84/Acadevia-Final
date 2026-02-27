package com.acadevia.course.controller;

import com.acadevia.course.dto.request.CreateModuleRequest;
import com.acadevia.course.dto.request.ReorderModulesRequest;
import com.acadevia.course.dto.request.UpdateModuleRequest;
import com.acadevia.course.dto.response.MessageResponse;
import com.acadevia.course.dto.response.ModuleDetailResponse;
import com.acadevia.course.dto.response.ModuleResponse;
import com.acadevia.course.service.ModuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses/{courseId}/modules")
@RequiredArgsConstructor
public class ModuleController {

    private final ModuleService moduleService;

    @GetMapping
    public ResponseEntity<List<ModuleResponse>> getCourseModules(@PathVariable Long courseId) {
        return ResponseEntity.ok(moduleService.getModulesByCourse(courseId));
    }

    @GetMapping("/{moduleId}")
    public ResponseEntity<ModuleDetailResponse> getModule(
            @PathVariable Long courseId,
            @PathVariable Long moduleId) {
        return ResponseEntity.ok(moduleService.getModuleById(courseId, moduleId));
    }

    @PostMapping
    public ResponseEntity<ModuleResponse> createModule(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateModuleRequest request,
            @RequestHeader("X-User-Id") Long teacherId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(moduleService.createModule(courseId, request, teacherId));
    }

    @PutMapping("/{moduleId}")
    public ResponseEntity<ModuleResponse> updateModule(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @Valid @RequestBody UpdateModuleRequest request,
            @RequestHeader("X-User-Id") Long teacherId) {
        return ResponseEntity.ok(moduleService.updateModule(courseId, moduleId, request, teacherId));
    }

    @DeleteMapping("/{moduleId}")
    public ResponseEntity<MessageResponse> deleteModule(
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @RequestHeader("X-User-Id") Long teacherId) {
        return ResponseEntity.ok(moduleService.deleteModule(courseId, moduleId, teacherId));
    }

    @PostMapping("/reorder")
    public ResponseEntity<MessageResponse> reorderModules(
            @PathVariable Long courseId,
            @Valid @RequestBody ReorderModulesRequest request,
            @RequestHeader("X-User-Id") Long teacherId) {
        return ResponseEntity.ok(moduleService.reorderModules(courseId, request, teacherId));
    }
}
