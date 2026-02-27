package com.acadevia.user.entity;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Converter;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.persistence.EntityListeners;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "teacher_school_mappings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"teacher_id", "school_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class TeacherSchoolMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "teacher_id", nullable = false)
    private Long teacherId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(columnDefinition = "json")
    @Convert(converter = StringListConverter.class)
    private List<String> subjects;

    @Column(length = 100)
    private String designation;

    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @Column(name = "is_primary_school")
    @Builder.Default
    private Boolean isPrimarySchool = true;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Column(name = "left_at")
    private LocalDateTime leftAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
}
