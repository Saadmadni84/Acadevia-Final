package com.acadevia.user.entity;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Converter;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.persistence.EntityListeners;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "user_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 10)
    private String pincode;

    @Column(name = "parent_name", length = 200)
    private String parentName;

    @Column(name = "parent_phone", length = 20)
    private String parentPhone;

    @Column(name = "parent_email")
    private String parentEmail;

    @Column(name = "emergency_contact", length = 20)
    private String emergencyContact;

    @Column(name = "blood_group", length = 5)
    private String bloodGroup;

    @Column(columnDefinition = "json")
    @Convert(converter = StringListConverter.class)
    private List<String> interests;

    @Column(columnDefinition = "json")
    @Convert(converter = StringListConverter.class)
    private List<String> achievements;

    @Column(name = "social_links", columnDefinition = "json")
    @Convert(converter = MapConverter.class)
    private Map<String, String> socialLinks;

    @Column(name = "notification_preferences", columnDefinition = "json")
    @Convert(converter = MapBooleanConverter.class)
    private Map<String, Boolean> notificationPreferences;

    @Column(name = "privacy_settings", columnDefinition = "json")
    @Convert(converter = MapBooleanConverter.class)
    private Map<String, Boolean> privacySettings;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Gender {
        MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
    }

    @Converter
    public static class StringListConverter implements AttributeConverter<List<String>, String> {
        private final ObjectMapper mapper = new ObjectMapper();

        @Override
        public String convertToDatabaseColumn(List<String> attribute) {
            try {
                return mapper.writeValueAsString(attribute);
            } catch (IOException e) {
                return "[]";
            }
        }

        @Override
        public List<String> convertToEntityAttribute(String dbData) {
            try {
                return mapper.readValue(dbData, new TypeReference<>() {});
            } catch (IOException e) {
                return List.of();
            }
        }
    }

    @Converter
    public static class MapConverter implements AttributeConverter<Map<String, String>, String> {
        private final ObjectMapper mapper = new ObjectMapper();

        @Override
        public String convertToDatabaseColumn(Map<String, String> attribute) {
            try {
                return mapper.writeValueAsString(attribute);
            } catch (IOException e) {
                return "{}";
            }
        }

        @Override
        public Map<String, String> convertToEntityAttribute(String dbData) {
            try {
                return mapper.readValue(dbData, new TypeReference<>() {});
            } catch (IOException e) {
                return Map.of();
            }
        }
    }

    @Converter
    public static class MapBooleanConverter implements AttributeConverter<Map<String, Boolean>, String> {
        private final ObjectMapper mapper = new ObjectMapper();

        @Override
        public String convertToDatabaseColumn(Map<String, Boolean> attribute) {
            try {
                return mapper.writeValueAsString(attribute);
            } catch (IOException e) {
                return "{}";
            }
        }

        @Override
        public Map<String, Boolean> convertToEntityAttribute(String dbData) {
            try {
                return mapper.readValue(dbData, new TypeReference<>() {});
            } catch (IOException e) {
                return Map.of();
            }
        }
    }
}
