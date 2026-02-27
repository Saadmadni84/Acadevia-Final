package com.acadevia.course.util;

public class AppConstants {
    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "20";
    public static final int MAX_PAGE_SIZE = 100;
    public static final int MIN_REVIEW_PROGRESS = 20; // Min % progress to leave review
    public static final String DEFAULT_SORT_BY = "id";
    public static final String DEFAULT_SORT_DIRECTION = "asc";

    public static final String KAFKA_TOPIC_COURSE_ENROLLED = "acadevia.course.enrolled";
    public static final String KAFKA_TOPIC_LESSON_COMPLETED = "acadevia.lesson.completed";
    public static final String KAFKA_TOPIC_COURSE_COMPLETED = "acadevia.course.completed";
    public static final String KAFKA_TOPIC_COURSE_PUBLISHED = "acadevia.course.published";
    public static final String KAFKA_TOPIC_COURSE_RATED = "acadevia.course.rated";
    
    // Cache Keys
    public static final String CACHE_COURSE_DETAIL = "courses:detail";
    public static final String CACHE_POPULAR_COURSES = "courses:popular";
    public static final String CACHE_FEATURED_COURSES = "courses:featured";
}
