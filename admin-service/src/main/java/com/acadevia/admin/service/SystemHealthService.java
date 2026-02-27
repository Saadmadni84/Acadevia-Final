package com.acadevia.admin.service;

import com.acadevia.admin.dto.response.SystemHealthResponse;

public interface SystemHealthService {
    SystemHealthResponse checkAllServices();
}
