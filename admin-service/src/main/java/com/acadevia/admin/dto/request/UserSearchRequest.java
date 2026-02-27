package com.acadevia.admin.dto.request;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserSearchRequest {
    private String query;
    private String role;
    private String schoolId;
    private String stateId;
    private Integer grade;
    private Boolean isActive;
    private Integer page;
    private Integer size;
    private String sortBy;
    private String sortDir;
}
