package com.acadevia.user.service;

import com.acadevia.user.dto.StudentMappingDto;
import java.util.Map;
import com.acadevia.user.dto.TeacherClassroomDto;
import com.acadevia.user.dto.TeacherMappingDto;
import com.acadevia.user.entity.Classroom;
import com.acadevia.user.entity.School;
import com.acadevia.user.entity.StudentClassroomMapping;
import com.acadevia.user.entity.TeacherClassroomMapping;
import com.acadevia.user.entity.TeacherSchoolMapping;
import com.acadevia.user.exception.MappingAlreadyExistsException;
import com.acadevia.user.exception.ResourceNotFoundException;
import com.acadevia.user.mapper.StudentMappingMapper;
import com.acadevia.user.mapper.TeacherMappingMapper;
import com.acadevia.user.repository.ClassroomRepository;
import com.acadevia.user.repository.SchoolRepository;
import com.acadevia.user.repository.StudentClassroomMappingRepository;
import com.acadevia.user.repository.TeacherClassroomMappingRepository;
import com.acadevia.user.repository.TeacherSchoolMappingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MappingService {

    private final TeacherSchoolMappingRepository teacherSchoolRepository;
    private final TeacherClassroomMappingRepository teacherClassroomRepository;
    private final StudentClassroomMappingRepository studentRepository;
    
    private final SchoolRepository schoolRepository;
    private final ClassroomRepository classroomRepository;
    
    private final TeacherMappingMapper teacherMapper;
    private final StudentMappingMapper studentMapper;

    // --- Teacher Mappings ---

    public TeacherMappingDto addTeacherToSchool(TeacherMappingDto dto) {
        if (teacherSchoolRepository.existsByTeacherIdAndSchoolIdAndIsActiveTrue(dto.getTeacherId(), dto.getSchoolId())) {
            throw new MappingAlreadyExistsException("Teacher is already mapped to this school");
        }

        School school = schoolRepository.findById(dto.getSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));

        TeacherSchoolMapping mapping = teacherMapper.toEntity(dto);
        mapping.setSchool(school);

        TeacherSchoolMapping saved = teacherSchoolRepository.save(mapping);
        schoolRepository.incrementTeacherCount(school.getId());
        
        return teacherMapper.toDto(saved);
    }

    public void assignTeacherToClassroom(TeacherClassroomDto dto) {
        if (teacherClassroomRepository.existsByTeacherIdAndClassroomIdAndSubjectAndIsActiveTrue(
                dto.getTeacherId(), dto.getClassroomId(), dto.getSubject())) {
            throw new MappingAlreadyExistsException("Teacher is already assigned to this classroom for this subject");
        }

        School school = schoolRepository.findById(dto.getSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
        Classroom classroom = classroomRepository.findById(dto.getClassroomId())
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));

        TeacherClassroomMapping mapping = TeacherClassroomMapping.builder()
                .teacherId(dto.getTeacherId())
                .classroom(classroom)
                .school(school)
                .subject(dto.getSubject())
                .isClassTeacher(dto.getIsClassTeacher())
                .isActive(true)
                .build();

        teacherClassroomRepository.save(mapping);

        if (Boolean.TRUE.equals(dto.getIsClassTeacher())) {
            classroom.setClassTeacherId(dto.getTeacherId());
            classroomRepository.save(classroom);
        }
    }

    public List<TeacherMappingDto> getTeachersBySchool(Long schoolId) {
        return teacherSchoolRepository.findBySchoolIdAndIsActiveTrue(schoolId)
                .stream()
                .map(teacherMapper::toDto)
                .collect(Collectors.toList());
    }

    // --- Student Mappings ---

    public StudentMappingDto enrollStudent(StudentMappingDto dto) {
        if (studentRepository.existsByStudentIdAndClassroomIdAndAcademicYear(
                dto.getStudentId(), dto.getClassroomId(), dto.getAcademicYear())) {
            throw new MappingAlreadyExistsException("Student is already enrolled in this classroom for the academic year");
        }

        School school = schoolRepository.findById(dto.getSchoolId())
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
        Classroom classroom = classroomRepository.findById(dto.getClassroomId())
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));

        StudentClassroomMapping mapping = studentMapper.toEntity(dto);
        mapping.setSchool(school);
        mapping.setClassroom(classroom);

        StudentClassroomMapping saved = studentRepository.save(mapping);
        
        classroomRepository.incrementStudentCount(classroom.getId());
        schoolRepository.incrementStudentCount(school.getId());

        return studentMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<StudentMappingDto> getStudentsBySchool(Long schoolId, Pageable pageable) {
        return studentRepository.findBySchoolId(schoolId, pageable)
                .map(studentMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentCurrentSchool(Long studentId) {
        // This would typically involve getting the current academic year logic
        // For simplicity returning latest active mapping
        // Logic to be refined based on requirements
        return null;
    }
}
