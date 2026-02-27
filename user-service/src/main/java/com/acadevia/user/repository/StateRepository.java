package com.acadevia.user.repository;

import com.acadevia.user.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StateRepository extends JpaRepository<State, Long> {
    List<State> findAllByIsActiveTrueOrderByNameAsc();
    Optional<State> findByCode(String code);
    Optional<State> findByCodeAndIsActiveTrue(String code);
    List<State> findByRegion(State.Region region);

    @Query("SELECT s FROM State s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%',:query,'%'))")
    List<State> searchByName(@Param("query") String query);
}
