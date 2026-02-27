package com.acadevia.course.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CourseFilterRequest {
    private Integer classGrade;
    private String subject;
    private String category;
    private String board;
    private String language;
    private String difficulty;
    private Boolean isFree;
    private Double minRating;
    private String query;
    
    @Builder.Default
    private int page = 0;
    
    @Builder.Default
    private int size = 20;
    
    @Builder.Default
    private String sortBy = "rating";
    
    @Builder.Default
    private String direction = "DESC";
}
