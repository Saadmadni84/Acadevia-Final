package com.acadevia.notification.service;

public interface UnreadCountService {
     void increment(Long userId);
     void reset(Long userId);
     long get(Long userId);
}
