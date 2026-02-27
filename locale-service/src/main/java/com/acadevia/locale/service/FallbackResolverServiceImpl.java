package com.acadevia.locale.service;

import com.acadevia.locale.entity.LanguageStateMapping;
import com.acadevia.locale.entity.Translation;
import com.acadevia.locale.entity.TranslationKey;
import com.acadevia.locale.repository.LanguageStateMappingRepository;
import com.acadevia.locale.repository.TranslationRepository;
import com.acadevia.locale.repository.TranslationKeyRepository;
import com.acadevia.locale.util.Constants;
import com.acadevia.locale.util.VariableInterpolator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FallbackResolverServiceImpl implements FallbackResolverService {

    private final TranslationRepository translationRepo;
    private final TranslationKeyRepository keyRepo;
    private final LanguageStateMappingRepository stateMappingRepo;

    /**
     * Fallback chain: Requested → State Default → Hindi → English → Key Name
     */
    @Override
    public String resolve(String keyName, String requestedLang, String stateCode, Map<String, String> variables) {
        String text = resolveWithoutVariables(keyName, requestedLang, stateCode);
        return VariableInterpolator.interpolate(text, variables);
    }

    @Override
    @Cacheable(value = "translationResolve", key = "#keyName + ':' + #requestedLang + ':' + (#stateCode != null ? #stateCode : 'none')")
    public String resolveWithoutVariables(String keyName, String requestedLang, String stateCode) {
        // Step 1: Try requested language
        if (requestedLang != null) {
            Optional<Translation> t = translationRepo.findByKeyNameAndLanguageCode(keyName, requestedLang);
            if (t.isPresent()) return t.get().getTranslatedText();
        }

        // Step 2: Try state default language
        if (stateCode != null) {
            String stateLang = getDefaultLanguageForState(stateCode);
            if (stateLang != null && !stateLang.equals(requestedLang)) {
                Optional<Translation> t = translationRepo.findByKeyNameAndLanguageCode(keyName, stateLang);
                if (t.isPresent()) return t.get().getTranslatedText();
            }
        }

        // Step 3: Try Hindi
        if (!"hi".equals(requestedLang)) {
            Optional<Translation> t = translationRepo.findByKeyNameAndLanguageCode(keyName, Constants.FALLBACK_LANGUAGE);
            if (t.isPresent()) return t.get().getTranslatedText();
        }

        // Step 4: Try English
        if (!"en".equals(requestedLang)) {
            Optional<Translation> t = translationRepo.findByKeyNameAndLanguageCode(keyName, Constants.DEFAULT_LANGUAGE);
            if (t.isPresent()) return t.get().getTranslatedText();
        }

        // Step 5: Return default value from key definition
        Optional<TranslationKey> key = keyRepo.findByKeyName(keyName);
        if (key.isPresent()) return key.get().getDefaultValue();

        // Step 6: Return key name as last resort
        log.warn("No translation found for key: {} in any language", keyName);
        return keyName;
    }

    @Override
    @Cacheable(value = "stateLanguage", key = "#stateCode")
    public String getDefaultLanguageForState(String stateCode) {
        return stateMappingRepo.findByStateCode(stateCode)
                .map(LanguageStateMapping::getPrimaryLanguageCode)
                .orElse(Constants.DEFAULT_LANGUAGE);
    }
}
