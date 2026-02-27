package com.acadevia.notification.service;

import com.acadevia.notification.dto.response.TemplateResponse;
import com.acadevia.notification.entity.NotificationTemplate;

import java.util.Optional;

public interface TemplateService {
    String getRenderedTemplate(String templateCode, java.util.Map<String, Object> variables, String language);
    
    TemplateResponse getTemplate(String code);
    
    TemplateResponse createTemplate(NotificationTemplate template);
    
    TemplateResponse updateTemplate(Long id, NotificationTemplate template);
    
    void deleteTemplate(Long id);
}
