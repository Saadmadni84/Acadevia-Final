package com.acadevia.course.service;

import com.acadevia.course.dto.request.CourseFilterRequest;
import com.acadevia.course.dto.request.CreateCourseRequest;
import com.acadevia.course.dto.request.UpdateCourseRequest;
import com.acadevia.course.dto.response.*;

import java.util.List;

public interface CourseService {

    PagedResponse<CourseCardResponse> getAllPublishedCourses(int page, int size, String sortBy, String direction);

    PagedResponse<CourseCardResponse> getCoursesByClassGrade(Integer classGrade, int page, int size);

    PagedResponse<CourseCardResponse> getCoursesBySubject(String subject, Integer classGrade, int page, int size);

    PagedResponse<CourseCardResponse> getCoursesByCategory(String category, Integer classGrade, int page, int size);

    PagedResponse<CourseCardResponse> getCoursesByBoard(String board, Integer classGrade, int page, int size);

    PagedResponse<CourseCardResponse> getCoursesByLanguage(String language, Integer classGrade, int page, int size);

    PagedResponse<CourseCardResponse> searchCourses(String query, int page, int size);

    PagedResponse<CourseCardResponse> getFilteredCourses(CourseFilterRequest filter, int page, int size);

    CourseDetailResponse getCourseById(Long courseId, Long userId);

    List<PopularCourseResponse> getPopularCourses();

    List<CourseCardResponse> getFeaturedCourses();

    List<CourseCardResponse> getRecommendedCourses(Long userId, Integer classGrade, String board, String language);

    PagedResponse<CourseCardResponse> getTeacherCourses(Long teacherId, int page, int size);

    CourseResponse createCourse(CreateCourseRequest request, Long teacherId);

    CourseResponse updateCourse(Long courseId, UpdateCourseRequest request, Long teacherId);

    MessageResponse submitForReview(Long courseId, Long teacherId);

    MessageResponse publishCourse(Long courseId); // ADMIN

    MessageResponse rejectCourse(Long courseId, String reason); // ADMIN

    MessageResponse archiveCourse(Long courseId, Long teacherId);

    MessageResponse deleteCourse(Long courseId, Long teacherId);

    CourseStatsResponse getCourseStats(Long courseId, Long teacherId);

    MessageResponse toggleFavorite(Long courseId, Long userId);

    PagedResponse<CourseCardResponse> getFavorites(Long userId, int page, int size);
}
