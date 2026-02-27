package com.acadevia.user.service;

import com.acadevia.user.dto.SchoolDto;
import com.acadevia.user.entity.City;
import com.acadevia.user.entity.School;
import com.acadevia.user.entity.State;
import com.acadevia.user.exception.ResourceNotFoundException;
import com.acadevia.user.exception.SchoolAlreadyExistsException;
import com.acadevia.user.mapper.SchoolMapper;
import com.acadevia.user.repository.CityRepository;
import com.acadevia.user.repository.SchoolRepository;
import com.acadevia.user.repository.StateRepository;
import com.acadevia.user.util.SchoolCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SchoolService {

    private final SchoolRepository schoolRepository;
    private final StateRepository stateRepository;
    private final CityRepository cityRepository;
    private final SchoolMapper schoolMapper;
    private final SchoolCodeGenerator schoolCodeGenerator;

    public SchoolDto createSchool(SchoolDto schoolDto) {
        if (schoolDto.getUdiseCode() != null && schoolRepository.findByUdiseCode(schoolDto.getUdiseCode()).isPresent()) {
            throw new SchoolAlreadyExistsException("School with UDISE code " + schoolDto.getUdiseCode() + " already exists");
        }

        State state = stateRepository.findById(schoolDto.getStateId())
                .orElseThrow(() -> new ResourceNotFoundException("State not found"));
        City city = cityRepository.findById(schoolDto.getCityId())
                .orElseThrow(() -> new ResourceNotFoundException("City not found"));

        if (!city.getState().getId().equals(state.getId())) {
            throw new IllegalArgumentException("City does not belong to the selected State");
        }

        School school = schoolMapper.toEntity(schoolDto);
        school.setState(state);
        school.setCity(city);
        
        // Generate unique school code
        school.setCode(schoolCodeGenerator.generateSchoolCode(state.getCode(), city.getDistrict(), school.getSchoolType()));

        School savedSchool = schoolRepository.save(school);
        log.info("Created new school with ID: {}", savedSchool.getId());
        return schoolMapper.toDto(savedSchool);
    }

    public SchoolDto updateSchool(Long id, SchoolDto schoolDto) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));

        schoolMapper.updateEntityFromDto(schoolDto, school);

        if (schoolDto.getStateId() != null && !schoolDto.getStateId().equals(school.getState().getId())) {
             State state = stateRepository.findById(schoolDto.getStateId())
                .orElseThrow(() -> new ResourceNotFoundException("State not found"));
             school.setState(state);
        }
        
        if (schoolDto.getCityId() != null && !schoolDto.getCityId().equals(school.getCity().getId())) {
            City city = cityRepository.findById(schoolDto.getCityId())
                    .orElseThrow(() -> new ResourceNotFoundException("City not found"));
            if (!city.getState().getId().equals(school.getState().getId())) {
                throw new IllegalArgumentException("City does not belong to the selected State");
            }
            school.setCity(city);
        }
        
        School updatedSchool = schoolRepository.save(school);
        return schoolMapper.toDto(updatedSchool);
    }

    @Transactional(readOnly = true)
    public SchoolDto getSchoolById(Long id) {
        return schoolRepository.findById(id)
                .map(schoolMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
    }

    @Transactional(readOnly = true)
    public SchoolDto getSchoolByCode(String code) {
        return schoolRepository.findByCode(code)
                .map(schoolMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("School not found with code: " + code));
    }

    @Transactional(readOnly = true)
    public Page<SchoolDto> getAllSchools(Pageable pageable) {
        return schoolRepository.findAll(pageable)
                .map(schoolMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<SchoolDto> getSchoolsByCity(Long cityId, Pageable pageable) {
        return schoolRepository.findByCityIdAndIsActiveTrue(cityId, pageable)
                .map(schoolMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<SchoolDto> searchSchools(String query, Pageable pageable) {
        return schoolRepository.searchSchools(query, pageable)
                .map(schoolMapper::toDto);
    }

    public void deleteSchool(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("School not found"));
        school.setIsActive(false);
        schoolRepository.save(school);
    }
}
