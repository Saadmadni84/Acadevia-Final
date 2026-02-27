package com.acadevia.user.util;

import com.acadevia.user.entity.enums.Board;
import com.acadevia.user.entity.enums.SchoolType;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SchoolCodeGenerator {

    public String generateSchoolCode(String stateCode, String districtName, SchoolType schoolType) {
        // Simple generation based on inputs + random suffix to ensure uniqueness for now
        String prefix = stateCode != null ? stateCode.toUpperCase() : "XX";
        String district = districtName != null ? districtName.substring(0, Math.min(3, districtName.length())).toUpperCase() : "DIS";
        String type = schoolType != null ? schoolType.name().substring(0, 1) : "S";
        
        return String.format("%s-%s-%s-%s", prefix, district, type, UUID.randomUUID().toString().substring(0, 6).toUpperCase());
    }


    public static String generateCode(Board board, String stateCode, Long sequence) {
        // Format: {BOARD}-{STATE}-{SEQ}
        // Example: CBSE-DL-001
        return String.format("%s-%s-%03d", board.name(), stateCode, sequence);
    }

    public static String generateFromUdise(String udiseCode) {
        // Use UDISE code directly as school code prefix or just use it as is if needed
        // For now, let's keep it simple
        return "UDISE-" + udiseCode;
    }
}
