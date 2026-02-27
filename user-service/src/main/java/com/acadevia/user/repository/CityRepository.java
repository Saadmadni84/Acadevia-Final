package com.acadevia.user.repository;

import com.acadevia.user.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CityRepository extends JpaRepository<City, Long> {
    List<City> findByStateIdAndIsActiveTrueOrderByNameAsc(Long stateId);
    List<City> findByStateCodeAndIsActiveTrueOrderByNameAsc(String stateCode);
    Optional<City> findByIdAndStateId(Long id, Long stateId);
    List<City> findByTier(City.CityTier tier);

    @Query("SELECT c FROM City c WHERE c.state.id = :stateId AND LOWER(c.name) LIKE LOWER(CONCAT('%',:query,'%'))")
    List<City> searchByNameInState(@Param("stateId") Long stateId, @Param("query") String query);

    @Query("SELECT COUNT(c) FROM City c WHERE c.state.id = :stateId AND c.isActive = true")
    Long countByStateId(@Param("stateId") Long stateId);
}
