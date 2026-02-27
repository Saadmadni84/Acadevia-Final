package com.acadevia.course.service.impl;

import com.acadevia.course.dto.request.CreateLessonRequest;
import com.acadevia.course.dto.request.ReorderLessonsRequest;
import com.acadevia.course.dto.request.UpdateLessonRequest;
import com.acadevia.course.dto.response.LessonDetailResponse;
import com.acadevia.course.dto.response.LessonResponse;
import com.acadevia.course.dto.response.MessageResponse;
import com.acadevia.course.entity.Lesson;
import com.acadevia.course.entity.Module;
import com.acadevia.course.enums.ContentType;
import com.acadevia.course.exception.ResourceNotFoundException;
import com.acadevia.course.exception.UnauthorizedException;
import com.acadevia.course.mapper.LessonMapper;
import com.acadevia.course.repository.LessonRepository;
import com.acadevia.course.repository.ModuleRepository;
import com.acadevia.course.service.LessonService;
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
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final ModuleRepository moduleRepository;
    private final LessonMapper lessonMapper;

    @Override
    @Transactional(readOnly = true)
    public List<LessonResponse> getLessonsByModule(Long courseId, Long moduleId) {
        // Validation that module belongs to course can be added but for perf maybe skip if ID is enough
        return lessonRepository.findByModuleIdAndIsActiveTrueOrderBySequenceOrderAsc(moduleId)
                .stream()
                .map(lessonMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LessonDetailResponse getLessonById(Long lessonId, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));
        return lessonMapper.toDetailResponse(lesson);
    }

    @Override
    @Transactional
    public LessonResponse createLesson(Long courseId, Long moduleId, CreateLessonRequest request, Long teacherId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", moduleId));
        
        if (!module.getCourse().getId().equals(courseId)) {
            throw new IllegalArgumentException("Module does not belong to the specified course");
        }

        if (!module.getCourse().getTeacherId().equals(teacherId)) {
            throw new UnauthorizedException("Not authorized");
        }

        Lesson lesson = lessonMapper.toEntity(request);
        lesson.setModule(module);
        lesson.setCourseId(courseId);
        
        Integer maxOrder = lessonRepository.findMaxSequenceOrder(moduleId);
        lesson.setSequenceOrder(maxOrder != null ? maxOrder + 1 : 1);
        
        Lesson savedLesson = lessonRepository.save(lesson);
        return lessonMapper.toResponse(savedLesson);
    }

    @Override
    @Transactional
    public LessonResponse updateLesson(Long lessonId, UpdateLessonRequest request, Long teacherId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));
        
        if (!lesson.getModule().getCourse().getTeacherId().equals(teacherId)) {
             throw new UnauthorizedException("Not authorized");
        }

        // Manual update from request
        if (request.getTitle() != null) lesson.setTitle(request.getTitle());
        if (request.getDescription() != null) lesson.setDescription(request.getDescription());
        if (request.getContentType() != null) lesson.setContentType(ContentType.valueOf(request.getContentType()));
        if (request.getContentUrl() != null) lesson.setContentUrl(request.getContentUrl());
        if (request.getContentText() != null) lesson.setContentText(request.getContentText());
        if (request.getVideoId() != null) lesson.setVideoId(request.getVideoId());
        if (request.getQuizId() != null) lesson.setQuizId(request.getQuizId());
        if (request.getGameId() != null) lesson.setGameId(request.getGameId());
        if (request.getDurationMinutes() != null) lesson.setDurationMinutes(request.getDurationMinutes());
        if (request.getSequenceOrder() != null) lesson.setSequenceOrder(request.getSequenceOrder());
        if (request.getXpReward() != null) lesson.setXpReward(request.getXpReward());
        if (request.getIsFreePreview() != null) lesson.setIsFreePreview(request.getIsFreePreview());
        if (request.getIsMandatory() != null) lesson.setIsMandatory(request.getIsMandatory());
        if (request.getLanguage() != null) lesson.setLanguage(request.getLanguage());
        if (request.getAttachmentUrls() != null) lesson.setAttachmentUrls(request.getAttachmentUrls());
        Lesson updatedLesson = lessonRepository.save(lesson);
        return lessonMapper.toResponse(updatedLesson);
    }

    @Override
    @Transactional
    public MessageResponse reorderLessons(Long moduleId, ReorderLessonsRequest request, Long teacherId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", moduleId));
        
        if (!module.getCourse().getTeacherId().equals(teacherId)) {
            throw new UnauthorizedException("Not authorized");
        }

        List<Lesson> lessons = lessonRepository.findByModuleIdAndIsActiveTrueOrderBySequenceOrderAsc(moduleId);
        Map<Long, Lesson> lessonMap = lessons.stream()
                .collect(Collectors.toMap(Lesson::getId, Function.identity()));

        for (ReorderLessonsRequest.ReorderItem item : request.getItems()) {
            Long lessonId = item.getLessonId();
            Integer newOrder = item.getSequenceOrder();
            if (lessonMap.containsKey(lessonId)) {
                lessonMap.get(lessonId).setSequenceOrder(newOrder);
            }
        }
        
        lessonRepository.saveAll(lessons);
        return MessageResponse.builder().message("Lessons reordered successfully").success(true).timestamp(LocalDateTime.now()).build();
    }

    @Override
    @Transactional
    public MessageResponse deleteLesson(Long lessonId, Long teacherId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));
        
        if (!lesson.getModule().getCourse().getTeacherId().equals(teacherId)) {
             throw new UnauthorizedException("Not authorized");
        }
        
        lessonRepository.delete(lesson);
        return MessageResponse.builder().message("Lesson deleted successfully").success(true).timestamp(LocalDateTime.now()).build();
    }
}
