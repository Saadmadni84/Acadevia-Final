package com.acadevia.sync.controller;

import com.acadevia.sync.dto.request.DeviceRegisterRequest;
import com.acadevia.sync.dto.response.DeviceInfoResponse;
import com.acadevia.sync.entity.DeviceRegistry;
import com.acadevia.sync.service.DeviceRegistryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
@Tag(name = "Device Management", description = "APIs for registering and managing user devices")
public class DeviceController {

    private final DeviceRegistryService deviceRegistryService;

    @PostMapping("/register")
    @Operation(summary = "Register device", description = "Register a new device for synchronization")
    public ResponseEntity<DeviceInfoResponse> registerDevice(@RequestBody DeviceRegisterRequest request) {
        DeviceRegistry device = deviceRegistryService.registerDevice(request.getUserId(), request);
        return ResponseEntity.ok(DeviceInfoResponse.builder()
                .deviceId(device.getDeviceId())
                .userId(device.getUserId())
                .deviceType(device.getDeviceType() != null ? device.getDeviceType().name() : null)
                .lastActive(device.getLastActiveTime())
                .build());
    }
}
