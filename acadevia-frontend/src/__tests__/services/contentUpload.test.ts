import { describe, it, expect, beforeEach } from 'vitest';
import { contentService, ACADEMIC_CLASSES, CURRICULUM_SUBJECTS } from '../../services/content.service';
import { uploadedContentStore } from '../../stores/uploadedContentStore';
import { dataService } from '../../services/data.service';

describe('Real Academic Content Upload System (Classes 1–12, PDF, Image, Video, Student Delivery)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Part 1: Provides Classes 1 through 12 dynamically across the system', async () => {
    const classes = await contentService.getClasses();
    expect(classes.length).toBe(12);
    expect(classes[0].classNumber).toBe(1);
    expect(classes[11].classNumber).toBe(12);

    // Consistency with dataService
    const dsClasses = dataService.getAcademicClasses();
    expect(dsClasses.length).toBe(12);
    expect(dsClasses).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('Part 2: Dynamically loads real curriculum subjects for each class', async () => {
    // Class 10 subjects
    const class10Subjects = await contentService.getSubjectsForClass(10);
    const subNames = class10Subjects.map((s) => s.name);
    expect(subNames).toContain('Mathematics');
    expect(subNames).toContain('Science');
    expect(subNames).toContain('English');
    expect(subNames).toContain('Hindi');
    expect(subNames).toContain('Social Science');
    expect(subNames).toContain('Computer Science');

    // Class 1 subjects
    const class1Subjects = await contentService.getSubjectsForClass(1);
    const c1Names = class1Subjects.map((s) => s.name);
    expect(c1Names).toContain('Environmental Studies');

    // Class 11 subjects
    const class11Subjects = await contentService.getSubjectsForClass(11);
    const c11Names = class11Subjects.map((s) => s.name);
    expect(c11Names).toContain('Physics');
    expect(c11Names).toContain('Chemistry');
  });

  it('Part 3: Loads real chapters including "Metals and Non-metals" for Class 10 Science', async () => {
    const chapters = await contentService.getChapters(10, 'Science');
    const titles = chapters.map((c) => c.title);
    expect(titles).toContain('Metals and Non-metals');
    expect(titles).toContain('Chemical Reactions and Equations');
    expect(titles).toContain('Acids, Bases and Salts');
  });

  it('Part 4 & 5: Validates supported file types (PDF, Image, Video) and rejects invalid files', async () => {
    // Unsupported type
    const invalidFile = new File(['dummy content'], 'script.exe', { type: 'application/x-msdownload' });
    await expect(
      contentService.uploadContentItem({
        file: invalidFile,
        title: 'Malicious Executable',
        classNumber: 10,
        subjectName: 'Science',
        chapterName: 'Metals and Non-metals',
      }),
    ).rejects.toThrow(/Unsupported file type/);

    // Missing title
    const validPdf = new File(['%PDF-1.4 dummy'], 'notes.pdf', { type: 'application/pdf' });
    await expect(
      contentService.uploadContentItem({
        file: validPdf,
        title: '   ',
        classNumber: 10,
        subjectName: 'Science',
        chapterName: 'Metals and Non-metals',
      }),
    ).rejects.toThrow(/Content title is required/);
  });

  it('Part 6, 7 & 8: Successfully uploads and persists PDF, Image, and Video content with metadata', async () => {
    // 1. Upload a PDF
    const pdfFile = new File(['%PDF-1.4 mock study notes binary data'], 'metals_notes.pdf', {
      type: 'application/pdf',
    });
    const pdfItem = await contentService.uploadContentItem({
      file: pdfFile,
      title: 'Class 10 Science: Metals and Non-metals Comprehensive Notes',
      description: 'Handwritten chapter summary with chemical equations',
      contentType: 'PDF',
      classNumber: 10,
      subjectName: 'Science',
      chapterName: 'Metals and Non-metals',
      teacherId: '11',
      teacherName: 'Dr. Vikram Malhotra',
      language: 'en',
    });

    expect(pdfItem.id).toBeDefined();
    expect(pdfItem.contentType).toBe('PDF');
    expect(pdfItem.classNumber).toBe(10);
    expect(pdfItem.subjectName).toBe('Science');
    expect(pdfItem.chapterName).toBe('Metals and Non-metals');
    expect(pdfItem.fileName).toBe('metals_notes.pdf');
    expect(pdfItem.mimeType).toBe('application/pdf');
    expect(pdfItem.teacherName).toBe('Dr. Vikram Malhotra');
    expect(pdfItem.status).toBe('PUBLISHED');

    // 2. Upload an Image (PNG)
    const imgFile = new File(['PNG image binary data'], 'reactivity_series.png', {
      type: 'image/png',
    });
    const imgItem = await contentService.uploadContentItem({
      file: imgFile,
      title: 'Metal Reactivity Series Diagram',
      description: 'High resolution visual diagram',
      contentType: 'IMAGE',
      classNumber: 10,
      subjectName: 'Science',
      chapterName: 'Metals and Non-metals',
      teacherId: '11',
      teacherName: 'Dr. Vikram Malhotra',
    });

    expect(imgItem.contentType).toBe('IMAGE');
    expect(imgItem.mimeType).toBe('image/png');

    // 3. Upload a Video (MP4)
    const videoFile = new File(['MP4 video stream binary data'], 'metals_extraction.mp4', {
      type: 'video/mp4',
    });
    const videoItem = await contentService.uploadContentItem({
      file: videoFile,
      title: 'Extraction of Metals from Ores Lecture',
      contentType: 'VIDEO',
      classNumber: 10,
      subjectName: 'Science',
      chapterName: 'Metals and Non-metals',
      teacherId: '11',
      teacherName: 'Dr. Vikram Malhotra',
    });

    expect(videoItem.contentType).toBe('VIDEO');
    expect(videoItem.mimeType).toBe('video/mp4');

    // Verify teacher list includes all 3 newly uploaded items
    const teacherContent = contentService.getContentItems({ classNumber: 10, subjectName: 'Science' });
    expect(teacherContent.some((i) => i.id === pdfItem.id)).toBe(true);
    expect(teacherContent.some((i) => i.id === imgItem.id)).toBe(true);
    expect(teacherContent.some((i) => i.id === videoItem.id)).toBe(true);
  });

  it('Part 10, 11 & 15: Delivers content to Class 10 student while strictly isolating from Class 9 or other subjects', async () => {
    // Upload content for Class 10 Science - Metals and Non-metals
    const pdfFile = new File(['PDF content'], 'metals.pdf', { type: 'application/pdf' });
    const uploadedItem = await contentService.uploadContentItem({
      file: pdfFile,
      title: 'Class 10 Metals PDF',
      contentType: 'PDF',
      classNumber: 10,
      subjectName: 'Science',
      chapterName: 'Metals and Non-metals',
    });

    // 1. Class 10 Science student query -> MUST see the content
    const class10ScienceContent = uploadedContentStore.getByChapter(10, 'Science', 'Metals and Non-metals');
    expect(class10ScienceContent.some((c) => c.id === uploadedItem.id)).toBe(true);

    // 2. Class 9 student query -> MUST NOT see Class 10 content
    const class9ScienceContent = uploadedContentStore.getByChapter(9, 'Science', 'Metals and Non-metals');
    expect(class9ScienceContent.length).toBe(0);

    // 3. Class 10 Mathematics query -> MUST NOT see Science content
    const class10MathContent = uploadedContentStore.getByChapter(10, 'Mathematics', 'Metals and Non-metals');
    expect(class10MathContent.length).toBe(0);
  });

  it('Part 12 & 13: Persistence test across simulated refresh and removal', async () => {
    const pdfFile = new File(['persistent doc'], 'chemlab.pdf', { type: 'application/pdf' });
    const created = await contentService.uploadContentItem({
      file: pdfFile,
      title: 'Chemistry Laboratory Safety Guide',
      contentType: 'PDF',
      classNumber: 10,
      subjectName: 'Science',
      chapterName: 'Chemical Reactions and Equations',
    });

    // Simulate page refresh by fetching freshly from store
    const refreshedItems = contentService.getContentItems({ classNumber: 10, subjectName: 'Science' });
    expect(refreshedItems.some((i) => i.id === created.id)).toBe(true);

    // Delete item
    await contentService.deleteContentItem(created.id);
    const afterDelete = contentService.getContentItems({ classNumber: 10, subjectName: 'Science' });
    expect(afterDelete.some((i) => i.id === created.id)).toBe(false);
  });
});
