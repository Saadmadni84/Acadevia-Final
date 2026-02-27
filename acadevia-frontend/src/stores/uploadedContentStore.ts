/**
 * Uploaded Content Store
 *
 * Persists video metadata in localStorage after teacher uploads.
 * Students can then browse uploaded content by class/subject/chapter.
 */

export interface UploadedVideo {
    id: string;
    title: string;
    description: string;
    cloudinaryUrl: string;
    cloudinaryPublicId: string;
    thumbnailUrl: string;
    subject: string;
    classGrade: number;
    chapter: string;
    language: string;
    duration?: number;
    uploadedBy: string;
    uploadedAt: string;
    fileSize: number;
}

const STORAGE_KEY = 'acadevia_uploaded_videos';

function getAll(): UploadedVideo[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function save(videos: UploadedVideo[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
}

export const uploadedContentStore = {
    /** Get all uploaded videos */
    getAll,

    /** Add a new video entry */
    add(video: UploadedVideo): void {
        const all = getAll();
        all.push(video);
        save(all);
    },

    /** Get videos for a specific class and subject */
    getByClassAndSubject(classGrade: number, subject: string): UploadedVideo[] {
        return getAll().filter(
            (v) => v.classGrade === classGrade && v.subject.toLowerCase() === subject.toLowerCase(),
        );
    },

    /** Get videos for a specific chapter */
    getByChapter(classGrade: number, subject: string, chapter: string): UploadedVideo[] {
        return getAll().filter(
            (v) =>
                v.classGrade === classGrade &&
                v.subject.toLowerCase() === subject.toLowerCase() &&
                v.chapter.toLowerCase() === chapter.toLowerCase(),
        );
    },

    /** Get unique classes that have content */
    getAvailableClasses(): number[] {
        const classes = new Set(getAll().map((v) => v.classGrade));
        return Array.from(classes).sort((a, b) => a - b);
    },

    /** Get unique subjects for a class */
    getSubjectsForClass(classGrade: number): string[] {
        const subjects = new Set(
            getAll()
                .filter((v) => v.classGrade === classGrade)
                .map((v) => v.subject),
        );
        return Array.from(subjects).sort();
    },

    /** Get unique chapters for a class+subject */
    getChaptersForSubject(classGrade: number, subject: string): string[] {
        const chapters = new Set(
            getAll()
                .filter(
                    (v) => v.classGrade === classGrade && v.subject.toLowerCase() === subject.toLowerCase(),
                )
                .map((v) => v.chapter),
        );
        return Array.from(chapters);
    },

    /** Remove a video by id */
    remove(id: string): void {
        const all = getAll().filter((v) => v.id !== id);
        save(all);
    },

    /** Clear all */
    clear(): void {
        localStorage.removeItem(STORAGE_KEY);
    },
};
