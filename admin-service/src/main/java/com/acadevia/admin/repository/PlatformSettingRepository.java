package com.acadevia.admin.repository;
import com.acadevia.admin.entity.PlatformSetting;
import com.acadevia.admin.enums.SettingCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface PlatformSettingRepository extends JpaRepository<PlatformSetting, Long> {
    Optional<PlatformSetting> findBySettingKey(String key);
    List<PlatformSetting> findByCategory(SettingCategory category);
    List<PlatformSetting> findByIsEditableTrue();
}
