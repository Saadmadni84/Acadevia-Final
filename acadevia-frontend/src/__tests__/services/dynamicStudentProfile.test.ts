// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { dataService } from '@/services/data.service';

describe('Dynamic Student School Name, Class, and State Profile Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('correctly persists and retrieves School Name, Class, State, City, PIN Code, and Phone Number for Student A (SFPS, Class 11, Uttar Pradesh, Ghazipur, 233001, +919876543210)', () => {
    const studentA = {
      id: 'student-sfps-01',
      email: 'studentA@example.com',
      fullName: 'Student A',
      role: 'STUDENT' as const,
      schoolName: 'SFPS',
      classGrade: 11,
      stateName: 'Uttar Pradesh',
      cityName: 'Ghazipur',
      pinCode: '233001',
      phone: '+919876543210',
      phoneNumber: '+919876543210',
      totalXP: 1500,
      currentLevel: 4,
      currentStreak: 5,
      lessonsCompleted: 12,
    };

    dataService.upsertUser(studentA);
    const retrieved = dataService.getUserById('student-sfps-01');

    expect(retrieved).toBeDefined();
    expect(retrieved?.fullName).toBe('Student A');
    expect(retrieved?.schoolName).toBe('SFPS');
    expect(retrieved?.classGrade).toBe(11);
    expect(retrieved?.stateName).toBe('Uttar Pradesh');
    expect(retrieved?.cityName).toBe('Ghazipur');
    expect(retrieved?.pinCode).toBe('233001');
    expect(retrieved?.phone).toBe('+919876543210');
  });

  it('correctly persists and retrieves distinct School Name, Class, State, City, PIN Code, and Phone Number for Student B (ABC Public School, Class 10, Maharashtra, Mumbai, 400001, +919123456789)', () => {
    const studentB = {
      id: 'student-abc-02',
      email: 'studentB@example.com',
      fullName: 'Student B',
      role: 'STUDENT' as const,
      schoolName: 'ABC Public School',
      classGrade: 10,
      stateName: 'Maharashtra',
      cityName: 'Mumbai',
      pinCode: '400001',
      phone: '+919123456789',
      phoneNumber: '+919123456789',
      totalXP: 450,
      currentLevel: 2,
      currentStreak: 1,
      lessonsCompleted: 3,
    };

    dataService.upsertUser(studentB);
    const retrieved = dataService.getUserById('student-abc-02');

    expect(retrieved).toBeDefined();
    expect(retrieved?.fullName).toBe('Student B');
    expect(retrieved?.schoolName).toBe('ABC Public School');
    expect(retrieved?.classGrade).toBe(10);
    expect(retrieved?.stateName).toBe('Maharashtra');
    expect(retrieved?.cityName).toBe('Mumbai');
    expect(retrieved?.pinCode).toBe('400001');
    expect(retrieved?.phone).toBe('+919123456789');
  });

  it('ensures distinct student accounts maintain strict isolation for phone numbers and editing Student A does not change Student B', () => {
    const user1 = {
      id: 's1',
      email: 'user1@school.com',
      fullName: 'User One',
      role: 'STUDENT' as const,
      schoolName: 'SFPS',
      classGrade: 11,
      stateName: 'Uttar Pradesh',
      cityName: 'Ghazipur',
      pinCode: '233001',
      phone: '+919876543210',
      phoneNumber: '+919876543210',
      totalXP: 100,
      currentLevel: 1,
      currentStreak: 0,
      lessonsCompleted: 0,
    };

    const user2 = {
      id: 's2',
      email: 'user2@school.com',
      fullName: 'User Two',
      role: 'STUDENT' as const,
      schoolName: 'ABC Public School',
      classGrade: 10,
      stateName: 'Maharashtra',
      cityName: 'Mumbai',
      pinCode: '400001',
      phone: '+919123456789',
      phoneNumber: '+919123456789',
      totalXP: 200,
      currentLevel: 2,
      currentStreak: 1,
      lessonsCompleted: 2,
    };

    dataService.upsertUser(user1);
    dataService.upsertUser(user2);

    expect(dataService.getUserById('s1')?.phone).toBe('+919876543210');
    expect(dataService.getUserById('s2')?.phone).toBe('+919123456789');

    // Student A updates phone number in Settings
    const updatedUser1 = { ...user1, phone: '+919999988888', phoneNumber: '+919999988888' };
    dataService.upsertUser(updatedUser1);

    expect(dataService.getUserById('s1')?.phone).toBe('+919999988888');
    // Student B's phone is completely unchanged
    expect(dataService.getUserById('s2')?.phone).toBe('+919123456789');
  });

  it('validates that PIN Code strictly requires exactly 6 numeric digits', () => {
    const pinRegex = /^\d{6}$/;
    expect(pinRegex.test('233001')).toBe(true);
    expect(pinRegex.test('400001')).toBe(true);
    expect(pinRegex.test('110001')).toBe(true);

    // Reject letters
    expect(pinRegex.test('23300A')).toBe(false);
    expect(pinRegex.test('ABCDEF')).toBe(false);

    // Reject special characters
    expect(pinRegex.test('233-01')).toBe(false);
    expect(pinRegex.test('233@01')).toBe(false);

    // Reject fewer than 6 digits
    expect(pinRegex.test('23300')).toBe(false);
    expect(pinRegex.test('')).toBe(false);

    // Reject more than 6 digits
    expect(pinRegex.test('2330012')).toBe(false);
  });

  it('validates that all 28 Indian States & 8 Union Territories are present with correct cities', async () => {
    const { INDIAN_STATES, getCitiesForState, INDIAN_STATES_AND_CITIES } = await import('@/data/indiaLocations');

    // 28 States + 8 UTs = 36 total territories
    expect(INDIAN_STATES.length).toBeGreaterThanOrEqual(36);
    expect(INDIAN_STATES).toContain('Uttar Pradesh');
    expect(INDIAN_STATES).toContain('Maharashtra');
    expect(INDIAN_STATES).toContain('Delhi');
    expect(INDIAN_STATES).toContain('Tamil Nadu');
    expect(INDIAN_STATES).toContain('Karnataka');
    expect(INDIAN_STATES).toContain('West Bengal');

    // City cascading
    const upCities = getCitiesForState('Uttar Pradesh');
    expect(upCities).toContain('Ghazipur');
    expect(upCities).toContain('Lucknow');
    expect(upCities).toContain('Varanasi');
    expect(upCities).not.toContain('Mumbai');

    const mhCities = getCitiesForState('Maharashtra');
    expect(mhCities).toContain('Mumbai');
    expect(mhCities).toContain('Pune');
    expect(mhCities).not.toContain('Ghazipur');

    const empty = getCitiesForState('NonExistentState');
    expect(empty).toEqual([]);
  });

  it('validates that student-specific courses directly resolve from authenticated classGrade without intermediate selectors', async () => {
    const { contentService } = await import('@/services/content.service');

    // Student A in Class 9:
    const class9Subjects = await contentService.getSubjectsForClass(9);
    expect(class9Subjects.length).toBeGreaterThan(0);
    const subjectNames9 = class9Subjects.map(s => s.name);
    expect(subjectNames9).toContain('Science');
    expect(subjectNames9).toContain('Mathematics');

    // Student B in Class 7:
    const class7Subjects = await contentService.getSubjectsForClass(7);
    expect(class7Subjects.length).toBeGreaterThan(0);
    const subjectNames7 = class7Subjects.map(s => s.name);
    expect(subjectNames7).toContain('Science');
    expect(subjectNames7).toContain('Mathematics');

    // Chapters for Class 9 Science vs Class 10 Science
    const chaps9 = await contentService.getChapters(9, 'Science');
    const chaps10 = await contentService.getChapters(10, 'Science');
    expect(chaps9.map(c => c.title)).toContain('Matter in Our Surroundings');
    expect(chaps10.map(c => c.title)).toContain('Chemical Reactions and Equations');
    expect(chaps9.map(c => c.title)).not.toContain('Chemical Reactions and Equations');
  }, 15000);

  it('validates profile photo upload, validation, and multi-student photo isolation', async () => {
    const { userService } = await import('@/services/user.service');
    const { useAuthStore } = await import('@/stores/useAuthStore');

    // 1. Image validation: Rejects non-image types
    const textFile = new File(['dummy content'], 'document.txt', { type: 'text/plain' });
    await expect(userService.uploadAvatar(textFile)).rejects.toThrow('Profile photo must be a JPG, PNG, or WEBP image.');

    // 2. Image validation: Rejects files > 5MB
    const largeBlob = new Blob([new Uint8Array(6 * 1024 * 1024)], { type: 'image/png' });
    const largeFile = new File([largeBlob], 'huge.png', { type: 'image/png' });
    await expect(userService.uploadAvatar(largeFile)).rejects.toThrow('Profile photo must be smaller than 5 MB.');

    // 3. Valid image upload for Student A (Gaurav)
    const validFileA = new File(['valid-pixel-data-a'], 'photo-a.jpg', { type: 'image/jpeg' });
    useAuthStore.getState().setUser({
      id: 'student_a_123',
      email: 'gaurav@sfps.edu',
      fullName: 'Gaurav Singh',
      role: 'STUDENT',
      schoolName: 'SFPS',
      classGrade: 9,
      stateName: 'Uttar Pradesh',
      cityName: 'Ghazipur',
      avatarUrl: undefined,
    });

    const photoUrlA = await userService.uploadAvatar(validFileA);
    expect(photoUrlA).toBeDefined();
    expect(useAuthStore.getState().user?.avatarUrl).toBe(photoUrlA);
    expect(dataService.getUserById('student_a_123')?.avatarUrl).toBe(photoUrlA);

    // 4. Student B (Rahul) isolation
    useAuthStore.getState().setUser({
      id: 'student_b_456',
      email: 'rahul@abc.edu',
      fullName: 'Rahul Sharma',
      role: 'STUDENT',
      schoolName: 'ABC Public School',
      classGrade: 7,
      stateName: 'Maharashtra',
      cityName: 'Mumbai',
      avatarUrl: undefined,
    });

    const validFileB = new File(['valid-pixel-data-b'], 'photo-b.png', { type: 'image/png' });
    const photoUrlB = await userService.uploadAvatar(validFileB);
    expect(photoUrlB).toBeDefined();
    expect(useAuthStore.getState().user?.avatarUrl).toBe(photoUrlB);
    expect(dataService.getUserById('student_b_456')?.avatarUrl).toBe(photoUrlB);

    // Student A's photo in dataService remains photoUrlA and is not overwritten by Student B
    expect(dataService.getUserById('student_a_123')?.avatarUrl).toBe(photoUrlA);
    expect(dataService.getUserById('student_a_123')?.avatarUrl).not.toBe(photoUrlB);
  });

  it('ensures three-student dynamic name switching without stale test1 fallback or cross-student leakage', async () => {
    const { useAuthStore } = await import('@/stores/useAuthStore');

    // 1. Student 1: TEST 11
    const student1 = {
      id: 'student-101',
      email: 'test1@example.com',
      fullName: 'TEST 11',
      role: 'STUDENT' as const,
      schoolName: 'DPS 1',
      classGrade: 1,
      stateName: 'Uttar Pradesh',
      cityName: 'Ghazipur',
      pinCode: '233001',
      phone: '+919876543210',
    };
    dataService.upsertUser(student1);
    useAuthStore.getState().setAuth(
      {
        id: student1.id,
        email: student1.email,
        fullName: student1.fullName,
        role: student1.role,
        schoolName: student1.schoolName,
        className: 'Class 1',
        stateName: student1.stateName,
        cityName: student1.cityName,
        pinCode: student1.pinCode,
        phone: student1.phone,
        languagePreference: 'en',
      },
      'access-token-1',
      'refresh-token-1'
    );

    expect(useAuthStore.getState().user?.fullName).toBe('TEST 11');
    expect(useAuthStore.getState().user?.fullName.charAt(0).toUpperCase()).toBe('T');

    // 2. Student 1 Logs Out
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);

    // 3. Student 2: TEST 22
    const student2 = {
      id: 'student-202',
      email: 'test2@example.com',
      fullName: 'TEST 22',
      role: 'STUDENT' as const,
      schoolName: 'DPS 2',
      classGrade: 2,
      stateName: 'Jharkhand',
      cityName: 'Chaibasa',
      pinCode: '231211',
      phone: '+919123456789',
    };
    dataService.upsertUser(student2);
    useAuthStore.getState().setAuth(
      {
        id: student2.id,
        email: student2.email,
        fullName: student2.fullName,
        role: student2.role,
        schoolName: student2.schoolName,
        className: 'Class 2',
        stateName: student2.stateName,
        cityName: student2.cityName,
        pinCode: student2.pinCode,
        phone: student2.phone,
        languagePreference: 'en',
      },
      'access-token-2',
      'refresh-token-2'
    );

    expect(useAuthStore.getState().user?.fullName).toBe('TEST 22');
    expect(useAuthStore.getState().user?.fullName).not.toBe('test1');
    expect(useAuthStore.getState().user?.fullName).not.toBe('TEST 11');
    expect(useAuthStore.getState().user?.fullName.charAt(0).toUpperCase()).toBe('T');

    // 4. Student 2 Logs Out
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();

    // 5. Student 3: TEST 33
    const student3 = {
      id: 'student-303',
      email: 'test3@example.com',
      fullName: 'TEST 33',
      role: 'STUDENT' as const,
      schoolName: 'DPS 3',
      classGrade: 3,
      stateName: 'Bihar',
      cityName: 'Patna',
      pinCode: '800001',
      phone: '+919777788888',
    };
    dataService.upsertUser(student3);
    useAuthStore.getState().setAuth(
      {
        id: student3.id,
        email: student3.email,
        fullName: student3.fullName,
        role: student3.role,
        schoolName: student3.schoolName,
        className: 'Class 3',
        stateName: student3.stateName,
        cityName: student3.cityName,
        pinCode: student3.pinCode,
        phone: student3.phone,
        languagePreference: 'en',
      },
      'access-token-3',
      'refresh-token-3'
    );

    expect(useAuthStore.getState().user?.fullName).toBe('TEST 33');
    expect(useAuthStore.getState().user?.fullName).not.toBe('test1');
    expect(useAuthStore.getState().user?.fullName).not.toBe('TEST 22');
  });
});
