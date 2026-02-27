package com.acadevia.admin.service;

import com.acadevia.admin.dto.request.GamificationRuleRequest;
import com.acadevia.admin.dto.response.GamificationRuleResponse;
import com.acadevia.admin.enums.RuleType;

import java.util.List;

public interface GamificationConfigService {
    List<GamificationRuleResponse> getAllRules();
    GamificationRuleResponse getRule(RuleType ruleType);
    GamificationRuleResponse updateRule(GamificationRuleRequest request, Long adminUserId);
    void initializeDefaultRules();
}
