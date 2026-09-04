package com.acadevia.content.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReplyCommentRequest {

    private String reply;
    private String comment;

    public String getEffectiveReply() {
        if (reply != null && !reply.isBlank()) {
            return reply.trim();
        }
        if (comment != null && !comment.isBlank()) {
            return comment.trim();
        }
        return "";
    }
}
