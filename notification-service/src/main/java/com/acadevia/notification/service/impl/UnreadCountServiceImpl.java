package com.acadevia.notification.service.impl;

import com.acadevia.notification.repository.NotificationRepository;
import com.acadevia.notification.service.UnreadCountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UnreadCountServiceImpl implements UnreadCountService {

    private final StringRedisTemplate redisTemplate;
    private final NotificationRepository notificationRepository;
    
    private static final String KEY_PREFIX = "notification:unread:";

    @Override
    public void increment(Long userId) {
        redisTemplate.opsForValue().increment(KEY_PREFIX + userId);
    }

    @Override
    public void reset(Long userId) {
        long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        redisTemplate.opsForValue().set(KEY_PREFIX + userId, String.valueOf(count));
    }

    @Override
    public long get(Long userId) {
        String val = redisTemplate.opsForValue().get(KEY_PREFIX + userId);
        if (val == null) {
            long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
            redisTemplate.opsForValue().set(KEY_PREFIX + userId, String.valueOf(count));
            return count;
        }
        return Long.parseLong(val);
    }
}
