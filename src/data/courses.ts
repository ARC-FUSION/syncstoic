import { Course } from '../types';

export const courses: Course[] = [
  {
    id: 'react-mastery',
    title: 'React Mastery: From Zero to Production',
    description: 'Master React from fundamentals to advanced patterns including hooks, context, performance optimization, and real-world architecture.',
    instructor: 'Fireship',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
    category: 'Frontend',
    totalDuration: 14400,
    enrolled: true,
    progress: 35,
    lastWatchedLessonId: 'l3',
    modules: [
      {
        id: 'm1',
        title: 'Getting Started',
        lessons: [
          { id: 'l1', title: 'Why React in 2024?', youtubeId: 'Tn6-PIqc4UM', duration: 720, completed: true, progress: 100, lastPosition: 720 },
          { id: 'l2', title: 'Setting Up Your Environment', youtubeId: 'hT3H8gEjzME', duration: 540, completed: true, progress: 100, lastPosition: 540 },
          { id: 'l3', title: 'Your First Component', youtubeId: 'Tn6-PIqc4UM', duration: 660, completed: false, progress: 60, lastPosition: 396 },
        ]
      },
      {
        id: 'm2',
        title: 'React Hooks Deep Dive',
        lessons: [
          { id: 'l4', title: 'useState & useEffect', youtubeId: 'eTDnfS2WE4Y', duration: 900, completed: false, progress: 0, lastPosition: 0 },
          { id: 'l5', title: 'useContext & useReducer', youtubeId: 'hT3H8gEjzME', duration: 840, completed: false, progress: 0, lastPosition: 0 },
          { id: 'l6', title: 'Custom Hooks Pattern', youtubeId: 'Tn6-PIqc4UM', duration: 780, completed: false, progress: 0, lastPosition: 0 },
        ]
      },
      {
        id: 'm3',
        title: 'State Management',
        lessons: [
          { id: 'l7', title: 'Context API vs Redux', youtubeId: 'eTDnfS2WE4Y', duration: 960, completed: false, progress: 0, lastPosition: 0 },
          { id: 'l8', title: 'Zustand & Jotai', youtubeId: 'hT3H8gEjzME', duration: 720, completed: false, progress: 0, lastPosition: 0 },
        ]
      }
    ]
  },
  {
    id: 'typescript-pro',
    title: 'TypeScript Pro: Advanced Patterns',
    description: 'Deep dive into TypeScript generics, conditional types, mapped types, and real-world patterns for scalable applications.',
    instructor: 'Theo',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=225&fit=crop',
    category: 'Languages',
    totalDuration: 10800,
    enrolled: true,
    progress: 12,
    lastWatchedLessonId: 'ts2',
    modules: [
      {
        id: 'ts-m1',
        title: 'Type System Fundamentals',
        lessons: [
          { id: 'ts1', title: 'Types vs Interfaces', youtubeId: 'Tn6-PIqc4UM', duration: 600, completed: true, progress: 100, lastPosition: 600 },
          { id: 'ts2', title: 'Generics Explained', youtubeId: 'eTDnfS2WE4Y', duration: 840, completed: false, progress: 25, lastPosition: 210 },
        ]
      },
      {
        id: 'ts-m2',
        title: 'Advanced Types',
        lessons: [
          { id: 'ts3', title: 'Conditional Types', youtubeId: 'hT3H8gEjzME', duration: 900, completed: false, progress: 0, lastPosition: 0 },
          { id: 'ts4', title: 'Template Literal Types', youtubeId: 'Tn6-PIqc4UM', duration: 720, completed: false, progress: 0, lastPosition: 0 },
          { id: 'ts5', title: 'Utility Types Deep Dive', youtubeId: 'eTDnfS2WE4Y', duration: 780, completed: false, progress: 0, lastPosition: 0 },
        ]
      }
    ]
  },
  {
    id: 'system-design',
    title: 'System Design Interview Prep',
    description: 'Learn to design scalable systems. Cover distributed systems, databases, caching, load balancing, and more.',
    instructor: 'Gaurav Sen',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
    category: 'Backend',
    totalDuration: 18000,
    enrolled: false,
    progress: 0,
    modules: [
      {
        id: 'sd-m1',
        title: 'Fundamentals',
        lessons: [
          { id: 'sd1', title: 'What is System Design?', youtubeId: 'Tn6-PIqc4UM', duration: 600, completed: false, progress: 0, lastPosition: 0 },
          { id: 'sd2', title: 'Vertical vs Horizontal Scaling', youtubeId: 'eTDnfS2WE4Y', duration: 720, completed: false, progress: 0, lastPosition: 0 },
          { id: 'sd3', title: 'Load Balancers', youtubeId: 'hT3H8gEjzME', duration: 840, completed: false, progress: 0, lastPosition: 0 },
        ]
      },
      {
        id: 'sd-m2',
        title: 'Data Layer',
        lessons: [
          { id: 'sd4', title: 'SQL vs NoSQL', youtubeId: 'Tn6-PIqc4UM', duration: 900, completed: false, progress: 0, lastPosition: 0 },
          { id: 'sd5', title: 'Caching Strategies', youtubeId: 'eTDnfS2WE4Y', duration: 780, completed: false, progress: 0, lastPosition: 0 },
          { id: 'sd6', title: 'Database Sharding', youtubeId: 'hT3H8gEjzME', duration: 660, completed: false, progress: 0, lastPosition: 0 },
        ]
      }
    ]
  },
  {
    id: 'nextjs-fullstack',
    title: 'Next.js 14: Full-Stack Development',
    description: 'Build production-ready apps with Next.js 14 App Router, Server Components, Server Actions, and modern deployment.',
    instructor: 'Jack Herrington',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop',
    category: 'Fullstack',
    totalDuration: 21600,
    enrolled: false,
    progress: 0,
    modules: [
      {
        id: 'nx-m1',
        title: 'App Router Basics',
        lessons: [
          { id: 'nx1', title: 'File-based Routing', youtubeId: 'Tn6-PIqc4UM', duration: 540, completed: false, progress: 0, lastPosition: 0 },
          { id: 'nx2', title: 'Layouts & Templates', youtubeId: 'eTDnfS2WE4Y', duration: 660, completed: false, progress: 0, lastPosition: 0 },
          { id: 'nx3', title: 'Server Components', youtubeId: 'hT3H8gEjzME', duration: 900, completed: false, progress: 0, lastPosition: 0 },
        ]
      },
      {
        id: 'nx-m2',
        title: 'Data Fetching',
        lessons: [
          { id: 'nx4', title: 'Server Actions', youtubeId: 'Tn6-PIqc4UM', duration: 780, completed: false, progress: 0, lastPosition: 0 },
          { id: 'nx5', title: 'Caching & Revalidation', youtubeId: 'eTDnfS2WE4Y', duration: 840, completed: false, progress: 0, lastPosition: 0 },
        ]
      }
    ]
  },
  {
    id: 'docker-k8s',
    title: 'Docker & Kubernetes Essentials',
    description: 'Containerize applications and orchestrate them with Kubernetes. From Docker basics to production deployments.',
    instructor: 'TechWorld with Nana',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-9d4c274c9c3a?w=400&h=225&fit=crop',
    category: 'DevOps',
    totalDuration: 16200,
    enrolled: false,
    progress: 0,
    modules: [
      {
        id: 'dk-m1',
        title: 'Docker Fundamentals',
        lessons: [
          { id: 'dk1', title: 'What are Containers?', youtubeId: 'Tn6-PIqc4UM', duration: 480, completed: false, progress: 0, lastPosition: 0 },
          { id: 'dk2', title: 'Dockerfile & Images', youtubeId: 'eTDnfS2WE4Y', duration: 720, completed: false, progress: 0, lastPosition: 0 },
          { id: 'dk3', title: 'Docker Compose', youtubeId: 'hT3H8gEjzME', duration: 660, completed: false, progress: 0, lastPosition: 0 },
        ]
      }
    ]
  },
  {
    id: 'ai-ml-primer',
    title: 'AI & Machine Learning Primer',
    description: 'Understand the fundamentals of AI/ML, neural networks, and how to integrate AI into your applications.',
    instructor: '3Blue1Brown',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop',
    category: 'AI/ML',
    totalDuration: 25200,
    enrolled: false,
    progress: 0,
    modules: [
      {
        id: 'ai-m1',
        title: 'Neural Networks',
        lessons: [
          { id: 'ai1', title: 'What is a Neural Network?', youtubeId: 'Tn6-PIqc4UM', duration: 900, completed: false, progress: 0, lastPosition: 0 },
          { id: 'ai2', title: 'Gradient Descent', youtubeId: 'eTDnfS2WE4Y', duration: 1020, completed: false, progress: 0, lastPosition: 0 },
          { id: 'ai3', title: 'Backpropagation', youtubeId: 'hT3H8gEjzME', duration: 840, completed: false, progress: 0, lastPosition: 0 },
        ]
      }
    ]
  }
];

export const categories = ['All', 'Frontend', 'Backend', 'Fullstack', 'Languages', 'DevOps', 'AI/ML'];
