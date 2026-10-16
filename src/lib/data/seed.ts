import type { Course, Difficulty, Lesson, Module } from '../types';
import { getYouTubeThumbnail } from '../utils';

/**
 * Seed data for SyncFocus LMS.
 * 6 courses, each with 3 modules and 4-5 lessons per module.
 * Video IDs are real, public YouTube tutorials.
 */

interface LessonInput {
  youtubeVideoId: string;
  title: string;
  durationSec: number;
  isPreview?: boolean;
}

interface ModuleInput {
  title: string;
  lessons: LessonInput[];
}

interface CourseInput {
  slug: string;
  title: string;
  description: string;
  instructor: string;
  difficulty: Difficulty;
  tags: string[];
  rating: number;
  enrolledCount: number;
  createdAt: string;
  modules: ModuleInput[];
  thumbnailVideoId?: string;
}

function buildCourse(input: CourseInput): Course {
  const modules: Module[] = input.modules.map((module, moduleIndex) => ({
    id: `${input.slug}-m${moduleIndex + 1}`,
    title: module.title,
    order: moduleIndex + 1,
    lessons: module.lessons.map(
      (lesson, lessonIndex): Lesson => ({
        id: `${input.slug}-m${moduleIndex + 1}-l${lessonIndex + 1}`,
        youtubeVideoId: lesson.youtubeVideoId,
        title: lesson.title,
        durationSec: lesson.durationSec,
        order: lessonIndex + 1,
        isPreview: lesson.isPreview ?? false,
        isCompleted: false,
      })
    ),
  }));

  const lessonCount = modules.reduce((count, module) => count + module.lessons.length, 0);
  const totalDurationSec = modules.reduce(
    (total, module) =>
      total + module.lessons.reduce((sum, lesson) => sum + lesson.durationSec, 0),
    0
  );
  const thumbnailVideoId =
    input.thumbnailVideoId ?? modules[0]?.lessons[0]?.youtubeVideoId ?? 'dQw4w9WgXcQ';

  return {
    id: input.slug,
    slug: input.slug,
    title: input.title,
    description: input.description,
    thumbnailUrl: getYouTubeThumbnail(thumbnailVideoId),
    instructor: input.instructor,
    difficulty: input.difficulty,
    tags: input.tags,
    modules,
    lessonCount,
    totalDurationSec,
    enrolledCount: input.enrolledCount,
    rating: input.rating,
    createdAt: input.createdAt,
  };
}

export const seedCourses: Course[] = [
  buildCourse({
    slug: 'react-fundamentals',
    title: 'React Fundamentals',
    description:
      'Master React from the ground up. Learn components, JSX, props, state, hooks and how to build and deploy real-world applications with modern React.',
    instructor: 'Traversy Media',
    difficulty: 'BEGINNER',
    tags: ['react', 'frontend', 'javascript', 'hooks'],
    rating: 4.8,
    enrolledCount: 15420,
    createdAt: '2024-01-15T00:00:00Z',
    thumbnailVideoId: 'w7ejDZ8SWv8',
    modules: [
      {
        title: 'Getting Started with React',
        lessons: [
          { youtubeVideoId: 'Tn6-PIqc4UM', title: 'React in 100 Seconds', durationSec: 120, isPreview: true },
          { youtubeVideoId: 'w7ejDZ8SWv8', title: 'React JS Crash Course', durationSec: 5400, isPreview: true },
          { youtubeVideoId: 'SqcY0GlETPk', title: 'Setting Up Your First React App', durationSec: 1680 },
          { youtubeVideoId: 'Ke90Tje7VS0', title: 'JSX and Rendering Elements', durationSec: 1500 },
        ],
      },
      {
        title: 'State, Props & Hooks',
        lessons: [
          { youtubeVideoId: 'O6P86uwfdR0', title: 'Understanding useState', durationSec: 900 },
          { youtubeVideoId: 'TNhaISOUy6Q', title: 'Essential React Hooks', durationSec: 1800 },
          { youtubeVideoId: 'bMknfKXIFA8', title: 'Props and Component Communication', durationSec: 1200 },
          { youtubeVideoId: 'dCLhUialKPQ', title: 'Building a To-Do App', durationSec: 1740 },
        ],
      },
      {
        title: 'Real-World React',
        lessons: [
          { youtubeVideoId: 'hdI2bqOjy3c', title: 'Handling Events and Forms', durationSec: 1620 },
          { youtubeVideoId: 'PkZNo7MFNFg', title: 'Fetching Data from APIs', durationSec: 1440 },
          { youtubeVideoId: 'W6NZfCO5SIk', title: 'Component Patterns and Composition', durationSec: 1320 },
          { youtubeVideoId: 'kUMe1FH4CHE', title: 'Deploying Your React App', durationSec: 1080 },
        ],
      },
    ],
  }),

  buildCourse({
    slug: 'nextjs-14-masterclass',
    title: 'Next.js 14 Masterclass',
    description:
      'Build production-ready full-stack applications with Next.js 14. Master the App Router, Server Components, Server Actions, data fetching and deployment.',
    instructor: 'JavaScript Mastery',
    difficulty: 'INTERMEDIATE',
    tags: ['nextjs', 'react', 'fullstack', 'ssr'],
    rating: 4.9,
    enrolledCount: 12850,
    createdAt: '2024-02-20T00:00:00Z',
    thumbnailVideoId: 'wm5gMKuwSYk',
    modules: [
      {
        title: 'Next.js Foundations',
        lessons: [
          { youtubeVideoId: 'Sklc_fQBmcs', title: 'Next.js in 100 Seconds', durationSec: 100, isPreview: true },
          { youtubeVideoId: '__mSgDEOyv8', title: 'Next.js 13 & 14 Basics', durationSec: 1500, isPreview: true },
          { youtubeVideoId: 'mTz0GXj8NN0', title: 'Next.js Crash Course', durationSec: 3600 },
          { youtubeVideoId: 'ZVnjOPwW4ZA', title: 'App Router Fundamentals', durationSec: 2400 },
        ],
      },
      {
        title: 'Data, Routing & Rendering',
        lessons: [
          { youtubeVideoId: 'wm5gMKuwSYk', title: 'Server Components Explained', durationSec: 1800 },
          { youtubeVideoId: 'YkOSUVzOAA4', title: 'Data Fetching Patterns', durationSec: 1680 },
          { youtubeVideoId: 'd56mG7DezGs', title: 'Server Actions Deep Dive', durationSec: 1740 },
          { youtubeVideoId: 'BwuLxPH8IDs', title: 'Caching and Revalidation', durationSec: 1440 },
          { youtubeVideoId: 'zQnBQ4tB3ZA', title: 'TypeScript with the App Router', durationSec: 900 },
        ],
      },
      {
        title: 'Production Apps',
        lessons: [
          { youtubeVideoId: 'Oe421EPjeBE', title: 'Building APIs with Route Handlers', durationSec: 1500 },
          { youtubeVideoId: 'w7ejDZ8SWv8', title: 'Authentication and Middleware', durationSec: 1620 },
          { youtubeVideoId: 'SqcY0GlETPk', title: 'Deploying to Production', durationSec: 1260 },
        ],
      },
    ],
  }),

  buildCourse({
    slug: 'typescript-deep-dive',
    title: 'TypeScript Deep Dive',
    description:
      'Go from JavaScript to confident TypeScript. Master the type system, generics, utility and conditional types, then apply them to real projects.',
    instructor: 'Academind',
    difficulty: 'INTERMEDIATE',
    tags: ['typescript', 'javascript', 'types', 'programming'],
    rating: 4.7,
    enrolledCount: 18920,
    createdAt: '2024-03-10T00:00:00Z',
    thumbnailVideoId: 'BwuLxPH8IDs',
    modules: [
      {
        title: 'TypeScript Fundamentals',
        lessons: [
          { youtubeVideoId: 'zQnBQ4tB3ZA', title: 'TypeScript in 100 Seconds', durationSec: 100, isPreview: true },
          { youtubeVideoId: 'd56mG7DezGs', title: 'Why TypeScript?', durationSec: 1080, isPreview: true },
          { youtubeVideoId: 'BwuLxPH8IDs', title: 'Basic Types and Annotations', durationSec: 1500 },
          { youtubeVideoId: 'ydkQlJhodio', title: 'Interfaces vs Type Aliases', durationSec: 1320 },
        ],
      },
      {
        title: 'Advanced Type System',
        lessons: [
          { youtubeVideoId: 'hdI2bqOjy3c', title: 'Generics Explained', durationSec: 1620 },
          { youtubeVideoId: 'PkZNo7MFNFg', title: 'Union and Intersection Types', durationSec: 1440 },
          { youtubeVideoId: 'W6NZfCO5SIk', title: 'Utility Types Deep Dive', durationSec: 1500 },
          { youtubeVideoId: 'O6P86uwfdR0', title: 'Conditional and Mapped Types', durationSec: 1680 },
        ],
      },
      {
        title: 'TypeScript in Practice',
        lessons: [
          { youtubeVideoId: 'w7ejDZ8SWv8', title: 'Type-Safe API Calls', durationSec: 1560 },
          { youtubeVideoId: 'Tn6-PIqc4UM', title: 'React + TypeScript Patterns', durationSec: 1740 },
          { youtubeVideoId: 'Oe421EPjeBE', title: 'Testing Type-Safe Code', durationSec: 1380 },
          { youtubeVideoId: '8JJ101D3knE', title: 'TypeScript Project Setup', durationSec: 900 },
        ],
      },
    ],
  }),

  buildCourse({
    slug: 'nodejs-backend',
    title: 'Node.js Backend',
    description:
      'Build scalable backends with Node.js and Express. Learn the event loop, REST API design, authentication, databases and container-based deployment.',
    instructor: 'Programming with Mosh',
    difficulty: 'INTERMEDIATE',
    tags: ['nodejs', 'backend', 'express', 'api', 'javascript'],
    rating: 4.8,
    enrolledCount: 14230,
    createdAt: '2024-01-28T00:00:00Z',
    thumbnailVideoId: 'TlB_eWDSMt4',
    modules: [
      {
        title: 'Node.js Fundamentals',
        lessons: [
          { youtubeVideoId: 'TlB_eWDSMt4', title: 'Node.js Tutorial for Beginners', durationSec: 3600, isPreview: true },
          { youtubeVideoId: 'ENrzD9HAZK4', title: 'Node.js Core Modules', durationSec: 900, isPreview: true },
          { youtubeVideoId: 'fBNz5xF-Kx4', title: 'Node.js Crash Course', durationSec: 5400 },
          { youtubeVideoId: '8aGhZQkoFbQ', title: 'The Event Loop Explained', durationSec: 1560 },
        ],
      },
      {
        title: 'Express & APIs',
        lessons: [
          { youtubeVideoId: 'Oe421EPjeBE', title: 'Express.js Crash Course', durationSec: 5400 },
          { youtubeVideoId: 'fBNz5xF-Kx4', title: 'Routing and Middleware', durationSec: 1500 },
          { youtubeVideoId: 'TlB_eWDSMt4', title: 'REST API Design', durationSec: 1440 },
          { youtubeVideoId: '8JJ101D3knE', title: 'Error Handling Patterns', durationSec: 1080 },
        ],
      },
      {
        title: 'Databases & Deployment',
        lessons: [
          { youtubeVideoId: 'lWMemPN9t6Q', title: 'MongoDB Integration', durationSec: 1720 },
          { youtubeVideoId: '3c-iBn73dDE', title: 'Docker for Node Apps', durationSec: 1740 },
          { youtubeVideoId: 'pTFZFxd4hOI', title: 'Docker Fundamentals', durationSec: 1620 },
          { youtubeVideoId: '5fLW5Q5ODiE', title: 'Monitoring and Performance', durationSec: 1080 },
        ],
      },
    ],
  }),

  buildCourse({
    slug: 'system-design-basics',
    title: 'System Design Basics',
    description:
      'Think like a senior engineer. Learn to design scalable, reliable systems and tackle system design interviews with confidence.',
    instructor: 'Gaurav Sen',
    difficulty: 'ADVANCED',
    tags: ['system-design', 'interview', 'architecture', 'scalability'],
    rating: 4.9,
    enrolledCount: 21450,
    createdAt: '2024-02-05T00:00:00Z',
    thumbnailVideoId: 'F2FmTdLtb_4',
    modules: [
      {
        title: 'System Design Foundations',
        lessons: [
          { youtubeVideoId: 'quLrc3PbuIw', title: 'What is System Design?', durationSec: 900, isPreview: true },
          { youtubeVideoId: 'xpDnVSmNFX0', title: 'Horizontal vs Vertical Scaling', durationSec: 720, isPreview: true },
          { youtubeVideoId: 'i53Gi_K3o7I', title: '20 Core System Design Concepts', durationSec: 600 },
          { youtubeVideoId: 'F2FmTdLtb_4', title: 'System Design Interview Prep', durationSec: 3600 },
        ],
      },
      {
        title: 'Databases & Caching',
        lessons: [
          { youtubeVideoId: 'lWMemPN9t6Q', title: 'SQL vs NoSQL', durationSec: 1500 },
          { youtubeVideoId: '8aGhZQkoFbQ', title: 'Caching Strategies', durationSec: 1560 },
          { youtubeVideoId: 'Oe421EPjeBE', title: 'Database Sharding and Replication', durationSec: 1620 },
          { youtubeVideoId: '5fLW5Q5ODiE', title: 'Consistency and the CAP Theorem', durationSec: 1080 },
        ],
      },
      {
        title: 'Scalable Systems in Practice',
        lessons: [
          { youtubeVideoId: '3c-iBn73dDE', title: 'Load Balancing with Containers', durationSec: 1740 },
          { youtubeVideoId: 'pTFZFxd4hOI', title: 'Containerisation for Scale', durationSec: 1620 },
          { youtubeVideoId: 'TlB_eWDSMt4', title: 'Designing for High Availability', durationSec: 1500 },
          { youtubeVideoId: 'ENrzD9HAZK4', title: 'Real-World Architecture Case Study', durationSec: 1200 },
        ],
      },
    ],
  }),

  buildCourse({
    slug: 'dsa-in-javascript',
    title: 'DSA in JavaScript',
    description:
      'Master data structures and algorithms in JavaScript. Crack coding interviews with arrays, trees, graphs and dynamic programming, explained step by step.',
    instructor: 'freeCodeCamp.org',
    difficulty: 'ADVANCED',
    tags: ['dsa', 'algorithms', 'interview', 'javascript', 'problem-solving'],
    rating: 4.9,
    enrolledCount: 25680,
    createdAt: '2024-03-01T00:00:00Z',
    thumbnailVideoId: 'RBSGKlAvoiM',
    modules: [
      {
        title: 'Arrays, Strings & Pointers',
        lessons: [
          { youtubeVideoId: 'PkZNo7MFNFg', title: 'DSA Foundations in JavaScript', durationSec: 1800, isPreview: true },
          { youtubeVideoId: 'hdI2bqOjy3c', title: 'Arrays and Strings', durationSec: 1500, isPreview: true },
          { youtubeVideoId: 'W6NZfCO5SIk', title: 'Two Pointer Technique', durationSec: 1320 },
          { youtubeVideoId: 'mU6anWqZJcc', title: 'Sliding Window Pattern', durationSec: 1440 },
          { youtubeVideoId: 'zJSY8tbf_ys', title: 'Prefix Sums and Hashing', durationSec: 1200 },
        ],
      },
      {
        title: 'Trees & Graphs',
        lessons: [
          { youtubeVideoId: 'RBSGKlAvoiM', title: 'Data Structures Deep Dive', durationSec: 1740 },
          { youtubeVideoId: '8hly31xKli0', title: 'Binary Trees and Traversals', durationSec: 1680 },
          { youtubeVideoId: 'B31LgI4Y4DQ', title: 'Graph Representation and BFS/DFS', durationSec: 1740 },
          { youtubeVideoId: '8jLOx1hD3_o', title: 'Binary Search Trees', durationSec: 1500 },
        ],
      },
      {
        title: 'Dynamic Programming',
        lessons: [
          { youtubeVideoId: 'oBt53YbR9Kk', title: 'Dynamic Programming Introduction', durationSec: 1800 },
          { youtubeVideoId: 'rfscVS0vtbw', title: 'Memoization vs Tabulation', durationSec: 1620 },
          { youtubeVideoId: 'x7X9w_GIm1s', title: 'Classic DP Problems', durationSec: 1740 },
          { youtubeVideoId: 'nu_pCVPKzTk', title: 'Interview Problem Walkthroughs', durationSec: 1500 },
          { youtubeVideoId: '8JJ101D3knE', title: 'Final Review and Practice', durationSec: 1080 },
        ],
      },
    ],
  }),
];

export function getCourseBySlug(slug: string): Course | undefined {
  return seedCourses.find((course) => course.slug === slug);
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  seedCourses.forEach((course) => course.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}
