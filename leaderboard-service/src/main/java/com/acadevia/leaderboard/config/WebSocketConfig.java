package com.acadevia.leaderboard.config;

import com.acadevia.leaderboard.util.Constants;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${acadevia.leaderboard.websocket.heartbeat-interval:25000}")
    private long heartbeatInterval;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker(Constants.WS_TOPIC_PREFIX)
                .setHeartbeatValue(new long[]{heartbeatInterval, heartbeatInterval})
                .setTaskScheduler(heartbeatTaskScheduler());
        registry.setApplicationDestinationPrefixes(Constants.WS_APP_PREFIX);
    }

    private TaskScheduler heartbeatTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("ws-heartbeat-");
        scheduler.initialize();
        return scheduler;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint(Constants.WS_ENDPOINT)
                .setAllowedOriginPatterns("*")
                .withSockJS()
                .setHeartbeatTime(heartbeatInterval);
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(128 * 1024);      // 128KB
        registration.setSendBufferSizeLimit(512 * 1024);    // 512KB
        registration.setSendTimeLimit(20000);                // 20 sec
    }
}
