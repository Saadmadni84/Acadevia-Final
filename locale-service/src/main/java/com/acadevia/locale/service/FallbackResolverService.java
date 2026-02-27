package com.acadevia.locale.service;

import java.util.Map;

public interface FallbackResolverService {
    String resolve(String keyName, String requestedLang, String stateCode, Map<String, String> variables);
    String resolveWithoutVariables(String keyName, String requestedLang, String stateCode);
    String getDefaultLanguageForState(String stateCode);
}
