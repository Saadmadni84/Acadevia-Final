package com.acadevia.user.service;

import com.acadevia.user.dto.ClassroomDto;
import com.acadevia.user.entity.Classroom;
import com.acadevia.user.entity.School;
import com.acadevia.user.exception.ResourceNotFoundException;
import com.acadevia.user.mapper.ClassroomMapper;
import com.acadevia.user.repository.ClassroomRepository;
import com.acadevia.user.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final SchoolRepository schoolRepository;
    private final ClassroomMapper classroomMapper;

    public ClassroomDto createClassroom(ClassroomDto classroomDto) {
        School school = schoolRepository.findById(classroomDto.getSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));

        classroomRepository.findBySchoolIdAndClassGradeAndSectionAndAcademicYear(
                school.getId(), classroomDto.getClassGrade(), classroomDto.getSection(), classroomDto.getAcademicYear())
                .ifPresent(c -> {
                    throw new IllegalArgumentException("Classroom already exists for this grade, section and academic year");
                });

        Classroom classroom = classroomMapper.toEntity(classroomDto);
        classroom.setSchool(school);

        Classroom savedClassroom = classroomRepository.save(classroom);
        
        // Update school stats
        schoolRepository.incrementStudentCount(school.getId()); // Logic might be different, keeping it simple for now or remove if not needed upon classroom creation
        
        return classroomMapper.toDto(savedClassroom);
    }

    public ClassroomDto updateClassroom(Long id, ClassroomDto classroomDto) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));

        classroomMapper.updateEntityFromDto(classroomDto, classroom);
        
        Classroom updatedClassroom = classroomRepository.save(classroom);
        return classroomMapper.toDto(updatedClassroom);
    }

    @Transactional(readOnly = true)
    public ClassroomDto getClassroomById(Long id) {
        return classroomRepository.findById(id)
                .map(classroomMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));
    }

    @Transactional(readOnly = true)
    public List<ClassroomDto> getClassroomsBySchool(Long schoolId) {
        return classroomRepository.findBySchoolIdAndIsActiveTrueOrderByClassGradeAscSectionAsc(schoolId)
                .stream()
                .map(classroomMapper::toDto)
                .collect(Collectors.toList());
    }

    public void deleteClassroom(Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));
        classroom.setIsActive(false);
        classroomRepository.save(classroom);
    }
}
