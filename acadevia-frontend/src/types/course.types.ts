export interface Course { id: string; title: string; description: string; thumbnailUrl?: string; subject: string; classLevel: string; language: string; teacherId: string; teacherName: string; teacherAvatarUrl?: string; modulesCount: number; lessonsCount: number; enrolledCount: number; rating: number; ratingsCount: number; isEnrolled?: boolean; progress?: number; createdAt: string; }
export interface CourseDetail extends Course { modules: Module[]; reviews: CourseReview[]; relatedCourses: Course[]; }
export interface Module { id: string; title: string; orderIndex: number; lessonsCount: number; completedCount?: number; lessons: LessonSummary[]; }
export interface LessonSummary { id: string; title: string; type: 'VIDEO' | 'QUIZ' | 'GAME' | 'TEXT'; duration?: number; isCompleted?: boolean; orderIndex: number; }
export interface CourseReview { id: string; userId: string; userName: string; avatarUrl?: string; rating: number; comment: string; createdAt: string; }
export interface EnrollRequest { courseId: string; }
