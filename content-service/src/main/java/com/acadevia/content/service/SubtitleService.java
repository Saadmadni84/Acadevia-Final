package com.acadevia.content.service;

import com.acadevia.content.dto.request.SubtitleCreateRequest;
import com.acadevia.content.dto.request.SubtitleUpdateRequest;
import com.acadevia.content.dto.response.SubtitleResponse;

import java.util.List;

public interface SubtitleService {

    SubtitleResponse createSubtitle(SubtitleCreateRequest request);

    SubtitleResponse updateSubtitle(Long subtitleId, SubtitleUpdateRequest request);

    List<SubtitleResponse> getSubtitlesByVideoId(Long videoId);

    SubtitleResponse getSubtitleByVideoAndLanguage(Long videoId, String languageCode);

    void deleteSubtitle(Long subtitleId);

    void setDefaultSubtitle(Long videoId, Long subtitleId);
}
