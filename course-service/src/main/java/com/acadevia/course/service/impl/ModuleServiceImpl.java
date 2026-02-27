package com.acadevia.course.service.impl;

import com.acadevia.course.dto.request.CreateModuleRequest;
import com.acadevia.course.dto.request.ReorderModulesRequest;
import com.acadevia.course.dto.request.UpdateModuleRequest;
import com.acadevia.course.dto.response.MessageResponse;
import com.acadevia.course.dto.response.ModuleDetailResponse;
import com.acadevia.course.dto.response.ModuleResponse;
import com.acadevia.course.entity.Course;
import com.acadevia.course.entity.Module;
import com.acadevia.course.exception.ResourceNotFoundException;
import com.acadevia.course.exception.UnauthorizedException;
import com.acadevia.course.mapper.ModuleMapper;
import com.acadevia.course.repository.CourseRepository;
import com.acadevia.course.repository.ModuleRepository;
import com.acadevia.course.service.ModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    private final ModuleMapper moduleMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ModuleResponse> getModulesByCourse(Long courseId) {
        return moduleRepository.findByCourseIdAndIsActiveTrueOrderBySequenceOrderAsc(courseId)
                .stream()
                .map(moduleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ModuleDetailResponse getModuleById(Long courseId, Long moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", moduleId));
        
        if (!module.getCourse().getId().equals(courseId)) {
            throw new IllegalArgumentException("Module does not belong to the specified course");
        }
        
        return moduleMapper.toDetailResponse(module);
    }

    @Override
    @Transactional
    public ModuleResponse createModule(Long courseId, CreateModuleRequest request, Long teacherId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        
        if (!course.getTeacherId().equals(teacherId)) {
            throw new UnauthorizedException("Not authorized to modify this course");
        }

        Module module = moduleMapper.toEntity(request);
        module.setCourse(course);
        
        // Calculate next sequence order
        Integer maxOrder = moduleRepository.findMaxSequenceOrder(courseId);
        module.setSequenceOrder(maxOrder != null ? maxOrder + 1 : 1);
        
        Module savedModule = moduleRepository.save(module);
        return moduleMapper.toResponse(savedModule);
    }

    @Override
    @Transactional
    public ModuleResponse updateModule(Long courseId, Long moduleId, UpdateModuleRequest request, Long teacherId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", moduleId));
        
        if (!module.getCourse().getId().equals(courseId)) {
            throw new IllegalArgumentException("Module does not belong to course");
        }
        
        if (!module.getCourse().getTeacherId().equals(teacherId)) {
            throw new UnauthorizedException("Not authorized");
        }

        if (request.getTitle() != null) module.setTitle(request.getTitle());
        if (request.getDescription() != null) module.setDescription(request.getDescription());
        if (request.getXpReward() != null) module.setXpReward(request.getXpReward());
        if (request.getIsFreePreview() != null) module.setIsFreePreview(request.getIsFreePreview());
        Module updatedModule = moduleRepository.save(module);
        return moduleMapper.toResponse(updatedModule);
    }

    @Override
    @Transactional
    public MessageResponse reorderModules(Long courseId, ReorderModulesRequest request, Long teacherId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        
        if (!course.getTeacherId().equals(teacherId)) {
            throw new UnauthorizedException("Not authorized");
        }

        List<Module> modules = moduleRepository.findByCourseIdAndIsActiveTrueOrderBySequenceOrderAsc(courseId);
        Map<Long, Module> moduleMap = modules.stream()
                .collect(Collectors.toMap(Module::getId, Function.identity()));

        for (ReorderModulesRequest.ReorderItem item : request.getItems()) {
            Long moduleId = item.getModuleId();
            Integer newOrder = item.getSequenceOrder();
            
            if (moduleMap.containsKey(moduleId)) {
                moduleMap.get(moduleId).setSequenceOrder(newOrder);
            }
        }
        
        moduleRepository.saveAll(modules);
        return MessageResponse.builder().message("Modules reordered successfully").success(true).timestamp(LocalDateTime.now()).build();
    }

    @Override
    @Transactional
    public MessageResponse deleteModule(Long courseId, Long moduleId, Long teacherId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", moduleId));
        
        if (!module.getCourse().getTeacherId().equals(teacherId)) {
            throw new UnauthorizedException("Not authorized");
        }
        
        moduleRepository.delete(module);
        return MessageResponse.builder().message("Module deleted successfully").success(true).timestamp(LocalDateTime.now()).build();
    }
}
