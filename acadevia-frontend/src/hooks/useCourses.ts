import { useQuery } from '@tanstack/react-query';
import { courseService } from '@/services/course.service';
import { APP_CONFIG } from '@/config/app.config';

export function useCourses(params?: { page?: number; size?: number; subject?: string; search?: string }) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      const { data } = await courseService.list(params);
      return data.data;
    },
    staleTime: APP_CONFIG.STALE_TIME.COURSES,
  });
}

export function useCourseDetail(courseId: string) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const { data } = await courseService.getById(courseId);
      return data.data;
    },
    enabled: !!courseId,
    staleTime: APP_CONFIG.STALE_TIME.COURSES,
  });
}

export function useEnrolledCourses() {
  return useQuery({
    queryKey: ['enrolled-courses'],
    queryFn: async () => {
      const { data } = await courseService.getEnrolled();
      return data.data;
    },
  });
}
