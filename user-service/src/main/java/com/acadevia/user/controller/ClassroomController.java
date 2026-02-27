package com.acadevia.user.controller;

import com.acadevia.user.dto.ClassroomDto;
import com.acadevia.user.service.ClassroomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService classroomService;

    @PostMapping("/schools/{schoolId}/classrooms")
    public ResponseEntity<ClassroomDto> createClassroom(
            @PathVariable Long schoolId,
            @Valid @RequestBody ClassroomDto classroomDto) {
        // Ensure the path variable ID matches or set it
        classroomDto.setSchoolId(schoolId);
        return new ResponseEntity<>(classroomService.createClassroom(classroomDto), HttpStatus.CREATED);
    }

    @GetMapping("/schools/{schoolId}/classrooms")
    public ResponseEntity<List<ClassroomDto>> getClassroomsBySchool(@PathVariable Long schoolId) {
        return ResponseEntity.ok(classroomService.getClassroomsBySchool(schoolId));
    }

    @GetMapping("/classrooms/{id}")
    public ResponseEntity<ClassroomDto> getClassroomById(@PathVariable Long id) {
        return ResponseEntity.ok(classroomService.getClassroomById(id));
    }

    @PutMapping("/classrooms/{id}")
    public ResponseEntity<ClassroomDto> updateClassroom(
            @PathVariable Long id,
            @Valid @RequestBody ClassroomDto classroomDto) {
        return ResponseEntity.ok(classroomService.updateClassroom(id, classroomDto));
    }

    @DeleteMapping("/classrooms/{id}")
    public ResponseEntity<Void> deleteClassroom(@PathVariable Long id) {
        classroomService.deleteClassroom(id);
        return ResponseEntity.noContent().build();
    }
}
