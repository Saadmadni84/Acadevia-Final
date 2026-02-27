# Course Service

This is the core microservice for the Acadevia platform, responsible for managing courses, modules, lessons, enrollments, progress tracking, and reviews.

## Technnologies Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA** (MySQL 8.0)
- **Spring Cloud Netflix Eureka** (Service Discovery)
- **Apache Kafka** (Event-Driven Architecture)
- **Redis** (Caching)
- **Flyway** (Database Migration)
- **MapStruct** (Object Mapping)
- **Lombok** (Boilerplate reduction)

## Architecture

The service follows a layered architecture:
- **Controller Layer**: REST API endpoints.
- **Service Layer**: Business logic, transaction management, event publishing.
- **Repository Layer**: Data access using Spring Data JPA.
- **Domain Layer**: JPA Entities.

## Key Features

- **Course Management**: Create, update, publish, and delete courses.
- **Curriculum Management**: Organize content into Modules and Lessons.
- **Enrollment System**: Handle user enrollments, drops, and completions.
- **Progress Tracking**: Track lesson progress, time spent, and course completion.
- **Reviews & Ratings**: Manage course reviews and calculate ratings.
- **Event Publishing**: Publishes Kafka events for critical actions (Enrolled, Completed, Rated).
- **Caching**: Caches popular and featured courses for performance.

## API Endpoints

### Courses
- `GET /api/v1/courses` - List all published courses (paginated)
- `GET /api/v1/courses/{id}` - Get simplified course details
- `POST /api/v1/courses` - Create a new course (Teacher)
- `PUT /api/v1/courses/{id}` - Update a course (Teacher)
- `POST /api/v1/courses/{id}/publish` - Publish a course (Admin)

### Modules & Lessons
- `GET /api/v1/courses/{id}/modules` - Get course modules
- `POST /api/v1/courses/{id}/modules` - Add module
- `POST /api/v1/courses/{courseId}/modules/{moduleId}/lessons` - Add lesson

### Enrollments
- `POST /api/v1/enrollments/{courseId}` - Enroll in a course
- `GET /api/v1/enrollments/my` - Get my enrollments

### Progress
- `POST /api/v1/progress/lessons/{id}/complete` - Mark lesson as complete

## Configuration

Ensure the following services are running:
1.  **MySQL Database**: Update credentials in `application.yml`
2.  **Redis**: Default port 6379
3.  **Kafka**: Default port 9092
4.  **Eureka Server**: Running on port 8761

## Build & Run

```bash
mvn clean install
mvn spring-boot:run
```
