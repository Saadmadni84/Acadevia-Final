package com.acadevia.content.service;

import com.acadevia.content.dto.request.VideoCreateRequest;
import com.acadevia.content.dto.response.VideoResponse;
import com.acadevia.content.dto.response.VideoSummaryResponse;
import com.acadevia.content.entity.Video;
import com.acadevia.content.exception.ResourceNotFoundException;
import com.acadevia.content.mapper.VideoMapper;
import com.acadevia.content.repository.VideoRepository;
import com.acadevia.content.service.impl.VideoServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VideoServiceImplTest {

    @Mock
    private VideoRepository videoRepository;

    @Mock
    private VideoMapper videoMapper;

    @InjectMocks
    private VideoServiceImpl videoService;

    @Test
    void createVideo_shouldReturnResponse() {
        VideoCreateRequest request = VideoCreateRequest.builder()
                .title("Test")
                .lessonId(1L)
                .courseId(1L)
                .build();

        Video entity = Video.builder().id(1L).title("Test").build();
        VideoResponse response = VideoResponse.builder().id(1L).title("Test").build();

        when(videoMapper.toEntity(any())).thenReturn(entity);
        when(videoRepository.save(any())).thenReturn(entity);
        when(videoMapper.toResponse(any())).thenReturn(response);

        VideoResponse result = videoService.createVideo(request);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(videoRepository).save(any());
    }

    @Test
    void getVideoById_shouldThrowWhenNotFound() {
        when(videoRepository.findByIdAndIsActiveTrue(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> videoService.getVideoById(99L));
    }

    @Test
    void getVideoById_shouldReturnSummary() {
        Video video = Video.builder().id(1L).title("Video").isActive(true).build();
        VideoSummaryResponse summary = VideoSummaryResponse.builder().id(1L).title("Video").build();

        when(videoRepository.findByIdAndIsActiveTrue(1L)).thenReturn(Optional.of(video));
        when(videoMapper.toSummaryResponse(video)).thenReturn(summary);

        VideoSummaryResponse result = videoService.getVideoById(1L);

        assertNotNull(result);
        assertEquals("Video", result.getTitle());
    }

    @Test
    void deleteVideo_shouldSoftDelete() {
        Video video = Video.builder().id(1L).isActive(true).build();
        when(videoRepository.findById(1L)).thenReturn(Optional.of(video));

        videoService.deleteVideo(1L);

        assertFalse(video.getIsActive());
        verify(videoRepository).save(video);
    }
}
