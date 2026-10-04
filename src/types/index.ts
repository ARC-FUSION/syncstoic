export interface Lesson {
  id: string;
  title: string;
  youtubeId: string;
  duration: number; // seconds
  completed: boolean;
  progress: number; // 0-100
  lastPosition: number; // seconds
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  category: string;
  totalDuration: number;
  modules: Module[];
  enrolled: boolean;
  progress: number;
  lastWatchedLessonId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}
