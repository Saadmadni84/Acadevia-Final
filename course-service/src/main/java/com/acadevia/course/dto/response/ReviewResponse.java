package com.acadevia.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userAvatar;
    private Integer rating;
    private String title;
    private String reviewText;
    private Boolean isVerified;
    private Integer helpfulCount;
    private String teacherReply;
    private LocalDateTime teacherRepliedAt;
    private LocalDateTime createdAt;
}
