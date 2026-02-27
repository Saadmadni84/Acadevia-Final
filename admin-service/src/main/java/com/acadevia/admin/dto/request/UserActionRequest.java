package com.acadevia.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserActionRequest {
    @NotNull private Long userId;
    @NotBlank private String action; // ACTIVATE, DEACTIVATE, RESET_PASSWORD, CHANGE_ROLE
    private String newRole;
    private String reason;
}
