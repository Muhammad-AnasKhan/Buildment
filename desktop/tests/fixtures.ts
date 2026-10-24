import type { Course, CourseDetail } from '../src/domain/catalog';

export const courses: Course[] = [
  {
    id: 'one',
    slug: 'systems',
    title: 'Systems from the ground up',
    description:
      'Understand processes, memory, and the foundations of Linux through hands-on projects.',
    coverUrl: null,
    difficulty: 'Intermediate',
    estimatedHours: 12,
    category: 'TECH',
    pricingType: 'FREE',
    priceCents: 0,
    currency: 'USD',
    projectGoal: 'Build a process explorer',
    instructorName: 'Buildment Team',
    moduleCount: 6,
    chapterCount: 24,
    enrollmentLifecycle: null,
  },
  {
    id: 'two',
    slug: 'communication',
    title: 'Communicate with clarity',
    description:
      'Turn complex ideas into clear conversations and become a more confident collaborator.',
    coverUrl: null,
    difficulty: 'Beginner',
    estimatedHours: 4,
    category: 'SOFT_SKILLS',
    pricingType: 'PAID',
    priceCents: 2500,
    currency: 'USD',
    projectGoal: null,
    instructorName: 'Course Mentor',
    moduleCount: 3,
    chapterCount: 12,
    enrollmentLifecycle: null,
  },
];

export const courseDetail: CourseDetail = {
  signedIn: true,
  ...courses[0],
  access: 'active',
  modules: [
    {
      id: 'module-one',
      title: 'Linux foundations',
      order: 1,
      chapters: [
        {
          id: 'chapter-one',
          title: 'Your first process',
          order: 1,
          estimatedMinutes: 15,
        },
        {
          id: 'chapter-two',
          title: 'Understanding memory',
          order: 2,
          estimatedMinutes: 25,
        },
      ],
    },
    {
      id: 'module-two',
      title: 'Resource controls',
      order: 2,
      chapters: [
        {
          id: 'chapter-three',
          title: 'Working with cgroups',
          order: 1,
          estimatedMinutes: 30,
        },
      ],
    },
  ],
};
