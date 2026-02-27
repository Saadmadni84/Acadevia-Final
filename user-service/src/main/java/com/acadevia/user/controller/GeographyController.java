package com.acadevia.user.controller;

import com.acadevia.user.dto.CityDto;
import com.acadevia.user.dto.StateDto;
import com.acadevia.user.service.GeographyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/geography")
@RequiredArgsConstructor
public class GeographyController {

    private final GeographyService geographyService;

    @GetMapping("/states")
    public ResponseEntity<List<StateDto>> getAllStates() {
        return ResponseEntity.ok(geographyService.getAllActiveStates());
    }

    @GetMapping("/states/{id}")
    public ResponseEntity<StateDto> getStateById(@PathVariable Long id) {
        return ResponseEntity.ok(geographyService.getStateById(id));
    }

    @GetMapping("/states/code/{code}")
    public ResponseEntity<StateDto> getStateByCode(@PathVariable String code) {
        return ResponseEntity.ok(geographyService.getStateByCode(code));
    }

    @GetMapping("/states/{stateId}/cities")
    public ResponseEntity<List<CityDto>> getCitiesByState(@PathVariable Long stateId) {
        return ResponseEntity.ok(geographyService.getCitiesByStateId(stateId));
    }

    @GetMapping("/cities/{id}")
    public ResponseEntity<CityDto> getCityById(@PathVariable Long id) {
        return ResponseEntity.ok(geographyService.getCityById(id));
    }

    @GetMapping("/search/states")
    public ResponseEntity<List<StateDto>> searchStates(@RequestParam String query) {
        return ResponseEntity.ok(geographyService.searchStates(query));
    }

    @GetMapping("/search/cities")
    public ResponseEntity<List<CityDto>> searchCities(
            @RequestParam Long stateId,
            @RequestParam String query) {
        return ResponseEntity.ok(geographyService.searchCitiesInState(stateId, query));
    }
}
