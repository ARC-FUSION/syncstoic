import { useNotesStore } from '../lib/stores/notesStore';
import { seedCourses } from '../lib/data/seed';
import { formatDuration } from '../lib/utils';
import { StickyNote, Search, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function Notes() {
  const { notes, deleteNote } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Group notes by course
  const notesByCourse = notes.reduce((acc, note) => {
    if (!acc[note.courseId]) {
      acc[note.courseId] = [];
    }
    acc[note.courseId].push(note);
    return acc;
  }, {} as Record<string, typeof notes>);

  // Filter by search query
  const filteredNotesByCourse = Object.entries(notesByCourse).reduce((acc, [courseId, courseNotes]) => {
    const filtered = courseNotes.filter((note) =>
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[courseId] = filtered;
    }
    return acc;
  }, {} as Record<string, typeof notes>);

  const handleDeleteNote = (id: string) => {
    if (confirm('Delete this note?')) {
      deleteNote(id);
    }
  };

  const handleExportNotes = () => {
    const markdown = Object.entries(filteredNotesByCourse)
      .map(([courseId, courseNotes]) => {
        const course = seedCourses.find((c) => c.id === courseId);
        if (!course) return '';

        const notesMarkdown = courseNotes
          .map((note) => {
            const lesson = course.modules
              .flatMap((m) => m.lessons)
              .find((l) => l.id === note.lessonId);
            const timestamp = formatTimestamp(note.timestamp);
            const lessonTitle = lesson?.title || 'Unknown Lesson';

            return `### ${lessonTitle} (${timestamp})\n\n${note.content}\n`;
          })
          .join('\n');

        return `## ${course.title}\n\n${notesMarkdown}`;
      })
      .join('\n\n---\n\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syncfocus-notes-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (notes.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-primary-500/10 rounded-full flex items-center justify-center">
              <StickyNote className="w-10 h-10 text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No notes yet</h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Start taking notes while watching videos. Notes are automatically saved with timestamps.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Notes</h1>
          <p className="text-white/60">All your notes from courses and lessons</p>
        </div>

        {/* Search and Export */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface-light border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={handleExportNotes}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-colors"
          >
            Export as Markdown
          </button>
        </div>

        {/* Notes by Course */}
        <div className="space-y-8">
          {Object.entries(filteredNotesByCourse).map(([courseId, courseNotes]) => {
            const course = seedCourses.find((c) => c.id === courseId);
            if (!course) return null;

            return (
              <div key={courseId}>
                <h2 className="text-xl font-bold text-white mb-4">{course.title}</h2>
                <div className="space-y-3">
                  {courseNotes.map((note) => {
                    const lesson = course.modules
                      .flatMap((m) => m.lessons)
                      .find((l) => l.id === note.lessonId);

                    return (
                      <div
                        key={note.id}
                        className="bg-surface-light/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
                      >
                        {/* Lesson Info */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Link
                              to={`/course/${course.slug}`}
                              className="text-primary-400 text-sm hover:text-primary-300 transition-colors"
                            >
                              {lesson?.title || 'Unknown Lesson'}
                            </Link>
                            <div className="text-white/40 text-xs mt-1">
                              {formatTimestamp(note.timestamp)} •{' '}
                              {new Date(note.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            aria-label="Delete note"
                          >
                            <Trash2 className="w-4 h-4 text-white/40 hover:text-red-400" />
                          </button>
                        </div>

                        {/* Note Content */}
                        <p className="text-white/80 text-sm whitespace-pre-wrap">{note.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
