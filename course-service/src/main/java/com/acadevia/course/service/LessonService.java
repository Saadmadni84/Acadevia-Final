package com.acadevia.course.service;

import com.acadevia.course.dto.request.CreateLessonRequest;
import com.acadevia.course.dto.request.ReorderLessonsRequest;
import com.acadevia.course.dto.request.UpdateLessonRequest;
import com.acadevia.course.dto.response.LessonDetailResponse;
import com.acadevia.course.dto.response.LessonResponse;
import com.acadevia.course.dto.response.MessageResponse;

import java.util.List;

public interface LessonService {
    List<LessonResponse> getLessonsByModule(Long courseId, Long moduleId);

    LessonDetailResponse getLessonById(Long lessonId, Long userId);

    LessonResponse createLesson(Long courseId, Long moduleId, CreateLessonRequest request, Long teacherId);

    LessonResponse updateLesson(Long lessonId, UpdateLessonRequest request, Long teacherId);

    MessageResponse reorderLessons(Long moduleId, ReorderLessonsRequest request, Long teacherId);

    MessageResponse deleteLesson(Long lessonId, Long teacherId);
}
