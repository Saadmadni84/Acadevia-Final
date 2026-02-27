package com.acadevia.sync.entity;

import com.acadevia.sync.enums.DeviceType;
import com.acadevia.sync.enums.SyncStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "device_registry")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceRegistry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String deviceId;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    private DeviceType deviceType;

    private String fcmToken; // For Push Notifications

    private String appVersion;
    private String osVersion;
    private String modelName;

    private LocalDateTime lastSyncTime;
    private LocalDateTime lastActiveTime;

    @Enumerated(EnumType.STRING)
    private SyncStatus lastSyncStatus;

    private Boolean isBlocked;
}
