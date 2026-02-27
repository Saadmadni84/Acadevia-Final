package com.acadevia.notification.service.impl;

import com.acadevia.notification.dto.response.TemplateResponse;
import com.acadevia.notification.entity.NotificationTemplate;
import com.acadevia.notification.repository.NotificationTemplateRepository;
import com.acadevia.notification.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class TemplateServiceImpl implements TemplateService {

    private final NotificationTemplateRepository templateRepository;
    private final TemplateEngine templateEngine;

    @Override
    public String getRenderedTemplate(String templateCode, Map<String, Object> variables, String language) {
        return templateRepository.findByTemplateKeyAndLanguageCodeAndIsActiveTrue(templateCode, language)
                .map(t -> {
                 Context ctx = new Context();
                 if(variables != null) ctx.setVariables(variables);
                 return templateEngine.process(t.getMessageTemplate(), ctx); // Use messageTemplate
            })
            .orElseGet(() -> {
                Context ctx = new Context();
                if(variables != null) ctx.setVariables(variables);
                return templateEngine.process(templateCode, ctx);
            });
    }

    @Override
    public TemplateResponse getTemplate(String code) {
        return null;
    }

    @Override
    public TemplateResponse createTemplate(NotificationTemplate template) {
        return null;
    }

    @Override
    public TemplateResponse updateTemplate(Long id, NotificationTemplate template) {
        return null;
    }

    @Override
    public void deleteTemplate(Long id) {
    }
}
