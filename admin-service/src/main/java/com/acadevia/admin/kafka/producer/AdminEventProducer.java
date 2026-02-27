package com.acadevia.admin.kafka.producer;

import com.acadevia.admin.dto.kafka.*;
import com.acadevia.admin.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishAdminAction(AdminActionEvent event) {
        kafkaTemplate.send(Constants.TOPIC_ADMIN_ACTION, String.valueOf(event.getAdminUserId()), event);
        log.info("Published admin action: {}", event.getAction());
    }

    public void publishSchoolOnboarded(SchoolOnboardedEvent event) {
        kafkaTemplate.send(Constants.TOPIC_SCHOOL_ONBOARDED, String.valueOf(event.getSchoolId()), event);
    }

    public void publishUserStatusChanged(UserStatusChangedEvent event) {
        kafkaTemplate.send(Constants.TOPIC_USER_STATUS_CHANGED, String.valueOf(event.getUserId()), event);
    }

    public void publishContentApproved(ContentApprovedEvent event) {
        kafkaTemplate.send(Constants.TOPIC_CONTENT_APPROVED, event.getContentType() + ":" + event.getContentId(), event);
    }

    public void publishRuleUpdated(RuleUpdatedEvent event) {
        kafkaTemplate.send(Constants.TOPIC_RULE_UPDATED, event.getRuleType(), event);
    }

    public void publishAnnouncement(AnnouncementBroadcastEvent event) {
        kafkaTemplate.send(Constants.TOPIC_ANNOUNCEMENT_BROADCAST, String.valueOf(event.getAnnouncementId()), event);
    }
}
