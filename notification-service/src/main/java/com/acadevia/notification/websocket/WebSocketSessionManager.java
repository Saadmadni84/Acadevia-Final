package com.acadevia.notification.websocket;

import com.acadevia.notification.service.UnreadCountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketSessionManager {

    private final SimpMessagingTemplate messagingTemplate;
    private final UnreadCountService unreadCountService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        Principal user = event.getUser();
        if (user != null) {
            log.info("User connected: {}", user.getName());
            // Send initial unread count on connect?
            // messagingTemplate.convertAndSendToUser(user.getName(), "/queue/unread-count", unreadCountService.get(Long.valueOf(user.getName())));
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        Principal user = event.getUser();
        if (user != null) {
            log.info("User disconnected: {}", user.getName());
        }
    }
}
