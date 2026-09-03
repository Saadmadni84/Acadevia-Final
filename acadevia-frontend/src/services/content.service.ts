/**
 * Content Service
 *
 * Real, end-to-end academic content service connecting teachers and students
 * for Classes 1–12 across PDF, Image, and Video content.
 */

import { fileStorageService } from './fileStorage.service';
import { uploadedContentStore } from '@/stores/uploadedContentStore';
import { apiClient } from '@/services/api.client';

function getApiUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    return window.location.origin + path;
  }
  return 'http://localhost:5173' + path;
}

export type ContentType = 'VIDEO' | 'PDF' | 'IMAGE';

export interface AcademicClass {
  id: number;
  classNumber: number;
  name: string;
}

export interface AcademicSubject {
  id: number;
  classId: number;
  classNumber: number;
  name: string;
  code?: string;
  icon?: string;
}

export interface AcademicChapter {
  id: number;
  subjectId: number;
  chapterNumber: number;
  title: string;
  description?: string;
}

export interface ContentItemRecord {
  id: string;
  title: string;
  description?: string;
  contentType: ContentType;
  classNumber: number;
  subjectName: string;
  chapterName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  language: string;
  teacherId?: string;
  teacherName?: string;
  schoolId?: number;
  status: 'PUBLISHED' | 'DRAFT';
  createdAt: string;
  durationSeconds?: number;
}

/* ------------------------------------------------------------------ */
/*  Standard Curriculum Definitions (Classes 1–12)                     */
/* ------------------------------------------------------------------ */

export const ACADEMIC_CLASSES: AcademicClass[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  classNumber: i + 1,
  name: `Class ${i + 1}`,
}));

export const CURRICULUM_SUBJECTS: Record<number, string[]> = {
  1: ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'General Knowledge', 'Computer Science'],
  2: ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'General Knowledge', 'Computer Science'],
  3: ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'General Knowledge', 'Computer Science'],
  4: ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'General Knowledge', 'Computer Science'],
  5: ['Mathematics', 'English', 'Hindi', 'Environmental Studies', 'General Knowledge', 'Computer Science'],
  6: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Computer Science'],
  7: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Computer Science'],
  8: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Computer Science'],
  9: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Computer Science'],
  10: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Computer Science'],
  11: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science', 'Economics', 'Business Studies', 'Accountancy'],
  12: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science', 'Economics', 'Business Studies', 'Accountancy'],
};

export const NCERT_CHAPTERS: Record<string, string[]> = {
  // Class 10 Science
  '10-Science': [
    'Chemical Reactions and Equations',
    'Acids, Bases and Salts',
    'Metals and Non-metals',
    'Carbon and its Compounds',
    'Periodic Classification of Elements',
    'Life Processes',
    'Control and Coordination',
    'How Do Organisms Reproduce?',
    'Heredity and Evolution',
    'Light – Reflection and Refraction',
    'The Human Eye and the Colourful World',
    'Electricity',
    'Magnetic Effects of Electric Current',
    'Sources of Energy',
    'Our Environment',
    'Management of Natural Resources',
  ],
  // Class 10 Mathematics
  '10-Mathematics': [
    'Real Numbers',
    'Polynomials',
    'Pair of Linear Equations in Two Variables',
    'Quadratic Equations',
    'Arithmetic Progressions',
    'Triangles',
    'Coordinate Geometry',
    'Introduction to Trigonometry',
    'Some Applications of Trigonometry',
    'Circles',
    'Constructions',
    'Areas Related to Circles',
    'Surface Areas and Volumes',
    'Statistics',
    'Probability',
  ],
  // Class 10 Social Science
  '10-Social Science': [
    'The Rise of Nationalism in Europe',
    'Nationalism in India',
    'The Making of a Global World',
    'Resources and Development',
    'Forest and Wildlife Resources',
    'Water Resources',
    'Agriculture',
    'Federalism',
    'Democracy and Diversity',
    'Development',
    'Sectors of the Indian Economy',
  ],
  // Class 10 English
  '10-English': [
    'A Letter to God',
    'Nelson Mandela: Long Walk to Freedom',
    'Two Stories about Flying',
    'From the Diary of Anne Frank',
    'The Hundred Dresses',
    'Glimpses of India',
    'Mijbil the Otter',
    'Madam Rides the Bus',
    'The Sermon at Benares',
    'The Proposal',
  ],
  // Class 10 Hindi
  '10-Hindi': [
    'कबीर की साखी',
    'मीरा के पद',
    'बिहारी के दोहे',
    'मनुष्यता',
    'पर्वत प्रदेश में पावस',
    'तोप',
    'कर चले हम फ़िदा',
    'आत्मत्राण',
    'बड़े भाई साहब',
    'डायरी का एक पन्ना',
  ],
  // Class 10 Computer Science
  '10-Computer Science': [
    'Computer Fundamentals & Hardware',
    'Operating System Basics',
    'Python Programming & Variables',
    'Conditional Statements & Loops in Python',
    'Functions & Modules',
    'HTML & Web Design Basics',
    'Cyber Ethics & Digital Footprint',
    'Database Concepts & SQL Basics',
  ],
  // Class 9 Science
  '9-Science': [
    'Matter in Our Surroundings',
    'Is Matter Around Us Pure?',
    'Atoms and Molecules',
    'Structure of the Atom',
    'The Fundamental Unit of Life',
    'Tissues',
    'Motion',
    'Force and Laws of Motion',
    'Gravitation',
    'Work and Energy',
    'Sound',
  ],
  // Class 9 Mathematics
  '9-Mathematics': [
    'Number Systems',
    'Polynomials',
    'Coordinate Geometry',
    'Linear Equations in Two Variables',
    'Introduction to Euclid Geometry',
    'Lines and Angles',
    'Triangles',
    'Quadrilaterals',
    'Circles',
    'Herons Formula',
    'Surface Areas and Volumes',
    'Statistics',
  ],
};

const MIME_MAP: Record<string, ContentType> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'IMAGE',
  'image/jpg': 'IMAGE',
  'image/png': 'IMAGE',
  'image/webp': 'IMAGE',
  'video/mp4': 'VIDEO',
  'video/webm': 'VIDEO',
};

const ALLOWED_MIME_TYPES = Object.keys(MIME_MAP);

class ContentService {
  /**
   * Get all academic classes (1 to 12)
   */
  async getClasses(): Promise<AcademicClass[]> {
    try {
      const res = await apiClient.get<AcademicClass[]>('/api/v1/content/classes');
      if (res.data && res.data.length > 0) return res.data;
    } catch {
      // Backend not running or offline, return standard classes 1-12
    }
    return ACADEMIC_CLASSES;
  }

  /**
   * Get subjects for a class
   */
  async getSubjectsForClass(classNumber: number): Promise<AcademicSubject[]> {
    try {
      const res = await apiClient.get<AcademicSubject[]>(`/api/v1/content/classes/${classNumber}/subjects`);
      if (res.data && res.data.length > 0) return res.data;
    } catch {
      // Fallback to curriculum database
    }

    const subNames = CURRICULUM_SUBJECTS[classNumber] || [
      'Mathematics',
      'Science',
      'English',
      'Hindi',
      'Social Science',
      'Computer Science',
    ];

    return subNames.map((name, idx) => ({
      id: classNumber * 100 + (idx + 1),
      classId: classNumber,
      classNumber,
      name,
      code: name.substring(0, 4).toUpperCase(),
    }));
  }

  /**
   * Get chapters for class and subject
   */
  async getChapters(classNumber: number, subjectName: string): Promise<AcademicChapter[]> {
    try {
      const subjectId = classNumber * 100 + 1;
      const res = await apiClient.get<AcademicChapter[]>(`/api/v1/content/subjects/${subjectId}/chapters`);
      if (res.data && res.data.length > 0) return res.data;
    } catch {
      // Use standard curriculum
    }

    const key = `${classNumber}-${subjectName}`;
    const chapterTitles = NCERT_CHAPTERS[key] || [
      `${subjectName} Chapter 1: Introduction`,
      `${subjectName} Chapter 2: Core Concepts`,
      `${subjectName} Chapter 3: Applications`,
      `${subjectName} Chapter 4: Practice & Problems`,
    ];

    // Check custom chapters added locally in uploadedContentStore
    const customTitles = uploadedContentStore.getChaptersForSubject(classNumber, subjectName);
    const combined = Array.from(new Set([...chapterTitles, ...customTitles]));

    return combined.map((title, idx) => ({
      id: idx + 1,
      subjectId: classNumber * 100 + 1,
      chapterNumber: idx + 1,
      title,
    }));
  }

  /**
   * Upload and persist content (PDF, Image, Video)
   */
  async uploadContentItem(params: {
    file: File;
    title: string;
    description?: string;
    contentType?: ContentType;
    classNumber: number;
    subjectName: string;
    chapterName: string;
    language?: string;
    teacherId?: string;
    teacherName?: string;
    schoolId?: number;
    onProgress?: (progress: number) => void;
  }): Promise<ContentItemRecord> {
    const { file, title, description, classNumber, subjectName, chapterName } = params;

    // 1. Validation
    if (!file) throw new Error('No file provided for upload');
    if (!title?.trim()) throw new Error('Content title is required');
    if (!classNumber || classNumber < 1 || classNumber > 12) throw new Error('Valid Class (1–12) is required');
    if (!subjectName?.trim()) throw new Error('Subject is required');
    if (!chapterName?.trim()) throw new Error('Chapter is required');

    const mimeType = file.type.toLowerCase();
    const resolvedType = params.contentType || MIME_MAP[mimeType];

    if (!resolvedType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(`Unsupported file type: ${mimeType || 'unknown'}. Allowed: PDF (.pdf), Image (.jpg, .png, .webp), Video (.mp4, .webm)`);
    }

    // Maximum 500MB for video, 50MB for PDF/Image
    const maxSize = resolvedType === 'VIDEO' ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File size exceeds limit (${Math.round(maxSize / (1024 * 1024))}MB)`);
    }

    params.onProgress?.(15);

    // 2. Upload actual binary file to server storage endpoint
    let serverFileUrl = '';
    let serverFileName = file.name;
    let serverFileSize = file.size;

    try {
      // For VIDEO content, use the MinIO-backed upload endpoint
      if (resolvedType === 'VIDEO') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('courseId', String(classNumber));
        formData.append('lessonId', String(params.schoolId || 1));
        formData.append('title', title.trim());

        const uploadRes = await apiClient.post('/api/v1/content/videos/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 300000, // 5 min timeout for large uploads
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              params.onProgress?.(15 + Math.round(pct * 0.4)); // 15% to 55%
            }
          },
        });

        if (uploadRes.data?.data?.playUrl) {
          serverFileUrl = uploadRes.data.data.playUrl;
          serverFileName = uploadRes.data.data.originalFilename || file.name;
          serverFileSize = uploadRes.data.data.fileSizeBytes || file.size;
        }
      } else {
        // Non-video uploads: use the generic upload endpoint
        const uploadRes = await fetch(getApiUrl('/api/v1/content/upload'), {
          method: 'POST',
          headers: {
            'x-filename': encodeURIComponent(file.name),
            'x-mime-type': mimeType,
            'x-content-type': resolvedType,
            'Content-Type': mimeType,
          },
          body: file,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData?.data?.fileUrl) {
            serverFileUrl = uploadData.data.fileUrl;
            serverFileName = uploadData.data.fileName || file.name;
            serverFileSize = uploadData.data.fileSize || file.size;
          }
        }
      }
    } catch (err) {
      console.warn('[contentService] Backend file upload failed, fallback to local storage:', err);
    }

    params.onProgress?.(55);

    // 3. Local IndexedDB storage (retained as local cache / offline fallback)
    const contentId = `cnt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let localDataUrl: string | undefined;
    try {
      const storedRecord = await fileStorageService.storeFile(contentId, file, file.name);
      localDataUrl = storedRecord.dataUrl;
    } catch {
      // Ignore IndexedDB failures if unsupported
    }

    // Use stable server URL for shared accessibility across devices, with local fallback
    const finalFileUrl = serverFileUrl || localDataUrl || '';

    // Generate thumbnail for images
    let thumbnailUrl = '';
    if (resolvedType === 'IMAGE') {
      thumbnailUrl = finalFileUrl || localDataUrl || '';
    }

    const itemRecord: ContentItemRecord = {
      id: contentId,
      title: title.trim(),
      description: description?.trim() || '',
      contentType: resolvedType,
      classNumber,
      subjectName,
      chapterName,
      fileName: serverFileName,
      fileSize: serverFileSize,
      mimeType,
      fileUrl: finalFileUrl,
      thumbnailUrl,
      language: params.language || 'en',
      teacherId: params.teacherId || '10',
      teacherName: params.teacherName || 'Rahul Verma',
      schoolId: params.schoolId || 1,
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
    };

    params.onProgress?.(80);

    // 4. Persist to uploadedContentStore for student/teacher discovery & backend sync
    uploadedContentStore.add({
      id: itemRecord.id,
      title: itemRecord.title,
      description: itemRecord.description || '',
      cloudinaryUrl: itemRecord.fileUrl,
      cloudinaryPublicId: '',
      thumbnailUrl: itemRecord.thumbnailUrl || '',
      subject: itemRecord.subjectName,
      classGrade: itemRecord.classNumber,
      chapter: itemRecord.chapterName,
      language: itemRecord.language,
      uploadedBy: itemRecord.teacherName || 'Teacher',
      uploadedAt: itemRecord.createdAt,
      fileSize: itemRecord.fileSize,
      contentType: itemRecord.contentType,
      fileName: itemRecord.fileName,
      mimeType: itemRecord.mimeType,
    });

    params.onProgress?.(100);
    return itemRecord;
  }

  /**
   * Get all content items matching filter
   */
  getContentItems(filter?: {
    classNumber?: number;
    subjectName?: string;
    chapterName?: string;
    contentType?: ContentType;
    teacherId?: string;
  }): ContentItemRecord[] {
    const all = uploadedContentStore.getAll();
    let filtered = all;

    if (filter?.classNumber) {
      filtered = filtered.filter((i) => i.classGrade === filter.classNumber);
    }
    if (filter?.subjectName && filter.subjectName !== 'All') {
      filtered = filtered.filter((i) => i.subject.toLowerCase() === filter.subjectName!.toLowerCase());
    }
    if (filter?.chapterName && filter.chapterName !== 'All') {
      filtered = filtered.filter((i) => i.chapter.toLowerCase() === filter.chapterName!.toLowerCase());
    }
    if (filter?.contentType) {
      filtered = filtered.filter((i) => (i.contentType || 'VIDEO') === filter.contentType);
    }

    return filtered.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      contentType: (item.contentType as ContentType) || 'VIDEO',
      classNumber: item.classGrade,
      subjectName: item.subject,
      chapterName: item.chapter,
      fileName: item.fileName || `${item.title}.${item.contentType === 'PDF' ? 'pdf' : item.contentType === 'IMAGE' ? 'png' : 'mp4'}`,
      fileSize: item.fileSize || 0,
      mimeType: item.mimeType || (item.contentType === 'PDF' ? 'application/pdf' : item.contentType === 'IMAGE' ? 'image/png' : 'video/mp4'),
      fileUrl: item.cloudinaryUrl,
      thumbnailUrl: item.thumbnailUrl,
      language: item.language || 'en',
      teacherName: item.uploadedBy || 'Teacher',
      status: 'PUBLISHED',
      createdAt: item.uploadedAt,
      durationSeconds: item.duration,
    }));
  }

  /**
   * Delete content item
   */
  async deleteContentItem(id: string): Promise<void> {
    uploadedContentStore.remove(id);
    await fileStorageService.deleteFile(id);
    try {
      await apiClient.delete(`/api/v1/content/items/${id}`);
    } catch {
      // offline
    }
  }

  /**
   * Get a short-lived presigned URL for authorized video playback.
   * Returns the presigned URL and a streaming fallback URL.
   */
  async getVideoPlayUrl(videoId: number | string): Promise<{
    presignedUrl: string;
    streamUrl: string;
    expiresInSeconds: number;
  }> {
    try {
      const res = await apiClient.get(`/api/v1/content/videos/${videoId}/play-url`);
      const data = res.data?.data;
      return {
        presignedUrl: data?.presignedUrl || '',
        streamUrl: data?.streamUrl || `/api/v1/content/videos/${videoId}/stream`,
        expiresInSeconds: data?.expiresInSeconds || 900,
      };
    } catch (err) {
      console.warn('[contentService] Failed to get play URL, falling back to stream:', err);
      return {
        presignedUrl: '',
        streamUrl: `/api/v1/content/videos/${videoId}/stream`,
        expiresInSeconds: 0,
      };
    }
  }

  /**
   * Get the backend streaming URL for a video (HTTP Range support).
   */
  getVideoStreamUrl(videoId: number | string): string {
    const base = import.meta.env.VITE_API_BASE_URL || '';
    return `${base}/api/v1/content/videos/${videoId}/stream`;
  }
}

export const contentService = new ContentService();
