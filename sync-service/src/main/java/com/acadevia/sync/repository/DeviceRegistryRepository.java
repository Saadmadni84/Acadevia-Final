package com.acadevia.sync.repository;

import com.acadevia.sync.entity.DeviceRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DeviceRegistryRepository extends JpaRepository<DeviceRegistry, Long> {
    Optional<DeviceRegistry> findByDeviceId(String deviceId);
}
