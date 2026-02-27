package com.acadevia.sync.service;

import com.acadevia.sync.dto.request.DeviceRegisterRequest;
import com.acadevia.sync.entity.DeviceRegistry;
import com.acadevia.sync.exception.DeviceNotRegisteredException;
import com.acadevia.sync.repository.DeviceRegistryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class DeviceRegistryService {

    private final DeviceRegistryRepository deviceRegistryRepository;

    @Transactional
    public DeviceRegistry registerDevice(Long userId, DeviceRegisterRequest request) {
        log.info("Registering device {} for user {}", request.getDeviceId(), userId);

        DeviceRegistry device = deviceRegistryRepository.findByDeviceId(request.getDeviceId())
                .orElseGet(() -> DeviceRegistry.builder()
                        .deviceId(request.getDeviceId())
                        .userId(userId)
                        .isBlocked(false)
                        .build());

        device.setDeviceType(request.getDeviceType());
        device.setOsVersion(request.getOsVersion());
        device.setAppVersion(request.getAppVersion());
        device.setModelName(request.getModelName());
        device.setFcmToken(request.getFcmToken());
        device.setLastActiveTime(LocalDateTime.now());

        if (!device.getUserId().equals(userId)) {
            log.warn("Device {} changing ownership from {} to {}", request.getDeviceId(), device.getUserId(), userId);
            device.setUserId(userId);
        }

        return deviceRegistryRepository.save(device);
    }

    public void validateDevice(Long userId, String deviceId) {
        DeviceRegistry device = deviceRegistryRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new DeviceNotRegisteredException("Device not found: " + deviceId));

        if (Boolean.TRUE.equals(device.getIsBlocked())) {
            throw new DeviceNotRegisteredException("Device is blocked: " + deviceId);
        }

        if (!device.getUserId().equals(userId)) {
            throw new DeviceNotRegisteredException("Device belongs to different user");
        }
    }

    @Transactional
    public void updateLastSync(String deviceId) {
        deviceRegistryRepository.findByDeviceId(deviceId)
                .ifPresent(device -> {
                    device.setLastSyncTime(LocalDateTime.now());
                    deviceRegistryRepository.save(device);
                });
    }
}
