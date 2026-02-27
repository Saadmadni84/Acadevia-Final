package com.acadevia.course.service;

import com.acadevia.course.dto.request.CompleteLessonRequest;
import com.acadevia.course.dto.response.CourseProgressResponse;
import com.acadevia.course.dto.response.LessonProgressResponse;

import java.util.List;

public interface ProgressService {
    LessonProgressResponse startLesson(Long lessonId, Long userId);

    LessonProgressResponse updateLessonProgress(Long lessonId, Long userId, Integer timeSpentSec, Integer lastPosition, Double progressPct);

    LessonProgressResponse completeLesson(Long lessonId, CompleteLessonRequest request, Long userId);

    CourseProgressResponse getCourseProgress(Long courseId, Long userId);

    List<LessonProgressResponse> getModuleProgress(Long courseId, Long moduleId, Long userId);
}
