import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Course, Module, Lesson } from '../types';

interface InstructorCourse extends Course {
  status: 'draft' | 'published';
  instructorId: string;
  createdAt: string;
  updatedAt: string;
}

interface InstructorState {
  courses: InstructorCourse[];
  students: Record<string, Array<{ userId: string; progress: number; lastActive: string }>>;
  addCourse: (course: Omit<InstructorCourse, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateCourse: (id: string, updates: Partial<InstructorCourse>) => void;
  deleteCourse: (id: string) => void;
  addModule: (courseId: string, module: Omit<Module, 'id'>) => void;
  updateModule: (courseId: string, moduleId: string, updates: Partial<Module>) => void;
  deleteModule: (courseId: string, moduleId: string) => void;
  reorderModules: (courseId: string, moduleIds: string[]) => void;
  addLesson: (courseId: string, moduleId: string, lesson: Omit<Lesson, 'id'>) => void;
  updateLesson: (courseId: string, moduleId: string, lessonId: string, updates: Partial<Lesson>) => void;
  deleteLesson: (courseId: string, moduleId: string, lessonId: string) => void;
  reorderLessons: (courseId: string, moduleId: string, lessonIds: string[]) => void;
  publishCourse: (courseId: string) => void;
  unpublishCourse: (courseId: string) => void;
}

export const useInstructorStore = create<InstructorState>()(
  persist(
    (set, get) => ({
      courses: [],
      students: {},

      addCourse: (courseData) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const newCourse: InstructorCourse = {
          ...courseData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ courses: [...state.courses, newCourse] }));
        return id;
      },

      updateCourse: (id, updates) => {
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === id ? { ...course, ...updates, updatedAt: new Date().toISOString() } : course
          ),
        }));
      },

      deleteCourse: (id) => {
        set((state) => ({
          courses: state.courses.filter((course) => course.id !== id),
          students: Object.fromEntries(
            Object.entries(state.students).filter(([courseId]) => courseId !== id)
          ),
        }));
      },

      addModule: (courseId, moduleData) => {
        const moduleId = crypto.randomUUID();
        const newModule: Module = { ...moduleData, id: moduleId };
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? { ...course, modules: [...course.modules, newModule], updatedAt: new Date().toISOString() }
              : course
          ),
        }));
      },

      updateModule: (courseId, moduleId, updates) => {
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.map((mod) =>
                    mod.id === moduleId ? { ...mod, ...updates } : mod
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : course
          ),
        }));
      },

      deleteModule: (courseId, moduleId) => {
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.filter((mod) => mod.id !== moduleId),
                  updatedAt: new Date().toISOString(),
                }
              : course
          ),
        }));
      },

      reorderModules: (courseId, moduleIds) => {
        set((state) => ({
          courses: state.courses.map((course) => {
            if (course.id !== courseId) return course;
            const moduleMap = new Map(course.modules.map((m) => [m.id, m]));
            const reordered = moduleIds
              .map((id, index) => {
                const mod = moduleMap.get(id);
                return mod ? { ...mod, order: index } : null;
              })
              .filter((m): m is Module => m !== null);
            return { ...course, modules: reordered, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      addLesson: (courseId, moduleId, lessonData) => {
        const lessonId = crypto.randomUUID();
        const newLesson: Lesson = { ...lessonData, id: lessonId };
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.map((mod) =>
                    mod.id === moduleId
                      ? { ...mod, lessons: [...mod.lessons, newLesson] }
                      : mod
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : course
          ),
        }));
      },

      updateLesson: (courseId, moduleId, lessonId, updates) => {
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.map((mod) =>
                    mod.id === moduleId
                      ? {
                          ...mod,
                          lessons: mod.lessons.map((lesson) =>
                            lesson.id === lessonId ? { ...lesson, ...updates } : lesson
                          ),
                        }
                      : mod
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : course
          ),
        }));
      },

      deleteLesson: (courseId, moduleId, lessonId) => {
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.map((mod) =>
                    mod.id === moduleId
                      ? { ...mod, lessons: mod.lessons.filter((l) => l.id !== lessonId) }
                      : mod
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : course
          ),
        }));
      },

      reorderLessons: (courseId, moduleId, lessonIds) => {
        set((state) => ({
          courses: state.courses.map((course) => {
            if (course.id !== courseId) return course;
            return {
              ...course,
              modules: course.modules.map((mod) => {
                if (mod.id !== moduleId) return mod;
                const lessonMap = new Map(mod.lessons.map((l) => [l.id, l]));
                const reordered = lessonIds
                  .map((id, index) => {
                    const lesson = lessonMap.get(id);
                    return lesson ? { ...lesson, order: index } : null;
                  })
                  .filter((l): l is Lesson => l !== null);
                return { ...mod, lessons: reordered };
              }),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      publishCourse: (courseId) => {
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? { ...course, status: 'published', updatedAt: new Date().toISOString() }
              : course
          ),
        }));
      },

      unpublishCourse: (courseId) => {
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? { ...course, status: 'draft', updatedAt: new Date().toISOString() }
              : course
          ),
        }));
      },
    }),
    {
      name: 'syncfocus-instructor',
      version: 1,
      migrate: () =>
        ({
          courses: [],
          students: {},
        }) as unknown as InstructorState,
    }
  )
);
