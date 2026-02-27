package com.acadevia.course.service;

import com.acadevia.course.dto.request.CreateModuleRequest;
import com.acadevia.course.dto.request.ReorderModulesRequest;
import com.acadevia.course.dto.request.UpdateModuleRequest;
import com.acadevia.course.dto.response.MessageResponse;
import com.acadevia.course.dto.response.ModuleDetailResponse;
import com.acadevia.course.dto.response.ModuleResponse;

import java.util.List;

public interface ModuleService {
    List<ModuleResponse> getModulesByCourse(Long courseId);

    ModuleDetailResponse getModuleById(Long courseId, Long moduleId);

    ModuleResponse createModule(Long courseId, CreateModuleRequest request, Long teacherId);

    ModuleResponse updateModule(Long courseId, Long moduleId, UpdateModuleRequest request, Long teacherId);

    MessageResponse reorderModules(Long courseId, ReorderModulesRequest request, Long teacherId);

    MessageResponse deleteModule(Long courseId, Long moduleId, Long teacherId);
}
