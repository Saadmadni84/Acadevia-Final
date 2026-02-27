package com.acadevia.notification.dto.response;

import lombok.*;

@Data
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UnreadCountResponse {
    private Long userId;
    private Long count;
}
