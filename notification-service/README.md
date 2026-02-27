# Notification Service

Microservice responsible for handling all platform notifications in Acadevia.

## Features
- **In-App Notifications**: Real-time via WebSocket (STOMP) and persistent history.
- **Email Notifications**: Asynchronous email sending with Thymeleaf templates.
- **Push Notifications**: Mobile push support (stubbed for FCM integration).
- **Preferences**: User-configurable notification settings per category and channel.
- **Kafka Consumers**: Event-driven architecture listening to Gamification, Course, and Classroom events.

## Tech Stack
- Java 17
- Spring Boot 3.2.0
- MySQL (Persistence)
- Redis (Unread counts, Caching)
- Kafka (Event Bus)
- WebSocket (STOMP)

## Running Locally

1. Ensure MySQL, Redis, and Kafka are running (use `docker-compose up` in root).
2. Build the project:
   ```bash
   mvn clean install
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

## API Documentation
Swagger UI available at: `http://localhost:8090/swagger-ui.html`
