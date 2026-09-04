package com.acadevia.content.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoCommentResponse {

    private Long id;
    private Long videoId;
    private String videoTitle;
    private Integer classGrade;
    private String subject;
    private String chapter;
    private Long userId;
    private String userName;
    private String userRole;
    private String comment;
    private Boolean isRead;
    private Boolean isResolved;
    private String reply;
    private String repliedByName;
    private LocalDateTime repliedAt;
    private Long parentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
