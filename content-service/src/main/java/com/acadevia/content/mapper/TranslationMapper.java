package com.acadevia.content.mapper;

import com.acadevia.content.dto.request.TranslationCreateRequest;
import com.acadevia.content.dto.response.TranslationResponse;
import com.acadevia.content.entity.ContentTranslation;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TranslationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isVerified", constant = "false")
    @Mapping(target = "verifiedBy", ignore = true)
    @Mapping(target = "verifiedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "contentType", expression = "java(com.acadevia.content.entity.enums.ContentType.valueOf(request.getContentType()))")
    ContentTranslation toEntity(TranslationCreateRequest request);

    @Mapping(target = "contentType", expression = "java(translation.getContentType() != null ? translation.getContentType().name() : null)")
    TranslationResponse toResponse(ContentTranslation translation);

    List<TranslationResponse> toResponseList(List<ContentTranslation> translations);
}
