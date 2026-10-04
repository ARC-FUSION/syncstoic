import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Note {
  id: string;
  lessonId: string;
  courseId: string;
  timestamp: number;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface NotesState {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  getNotesByLesson: (lessonId: string) => Note[];
  getNotesByCourse: (courseId: string) => Note[];
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (noteData) => {
        const newNote: Note = {
          ...noteData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({ notes: [...state.notes, newNote] }));
      },

      updateNote: (id, content) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? { ...note, content, updatedAt: Date.now() } : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },

      getNotesByLesson: (lessonId) => {
        return get().notes
          .filter((note) => note.lessonId === lessonId)
          .sort((a, b) => a.timestamp - b.timestamp);
      },

      getNotesByCourse: (courseId) => {
        return get().notes
          .filter((note) => note.courseId === courseId)
          .sort((a, b) => b.createdAt - a.createdAt);
      },
    }),
    {
      name: 'syncfocus-notes',
    }
  )
);
