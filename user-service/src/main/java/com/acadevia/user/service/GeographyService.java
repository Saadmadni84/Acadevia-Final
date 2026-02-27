package com.acadevia.user.service;

import com.acadevia.user.dto.CityDto;
import com.acadevia.user.dto.StateDto;
import com.acadevia.user.entity.City;
import com.acadevia.user.entity.State;
import com.acadevia.user.exception.ResourceNotFoundException;
import com.acadevia.user.mapper.CityMapper;
import com.acadevia.user.mapper.StateMapper;
import com.acadevia.user.repository.CityRepository;
import com.acadevia.user.repository.StateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GeographyService {

    private final StateRepository stateRepository;
    private final CityRepository cityRepository;
    private final StateMapper stateMapper;
    private final CityMapper cityMapper;

    @Cacheable("states")
    public List<StateDto> getAllActiveStates() {
        return stateRepository.findAllByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(stateMapper::toDto)
                .collect(Collectors.toList());
    }

    public StateDto getStateById(Long id) {
        return stateRepository.findById(id)
                .map(stateMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("State not found with ID: " + id));
    }

    public StateDto getStateByCode(String code) {
        return stateRepository.findByCodeAndIsActiveTrue(code)
                .map(stateMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("State not found with code: " + code));
    }

    @Cacheable(value = "cities", key = "#stateId")
    public List<CityDto> getCitiesByStateId(Long stateId) {
        return cityRepository.findByStateIdAndIsActiveTrueOrderByNameAsc(stateId)
                .stream()
                .map(cityMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<CityDto> getCitiesByStateCode(String stateCode) {
        return cityRepository.findByStateCodeAndIsActiveTrueOrderByNameAsc(stateCode)
                .stream()
                .map(cityMapper::toDto)
                .collect(Collectors.toList());
    }

    public CityDto getCityById(Long id) {
        return cityRepository.findById(id)
                .map(cityMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("City not found with ID: " + id));
    }

    public List<StateDto> searchStates(String query) {
        return stateRepository.searchByName(query)
                .stream()
                .map(stateMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<CityDto> searchCitiesInState(Long stateId, String query) {
        return cityRepository.searchByNameInState(stateId, query)
                .stream()
                .map(cityMapper::toDto)
                .collect(Collectors.toList());
    }
}
