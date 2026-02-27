package com.acadevia.notification.config;

import com.acadevia.notification.util.Constants;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker(Constants.WS_TOPIC_PREFIX, Constants.WS_USER_PREFIX);
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix(Constants.WS_USER_PREFIX);
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint(Constants.WS_ENDPOINT)
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
