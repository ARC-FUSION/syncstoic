import { useState } from 'react';
import { useNotesStore } from '../../lib/stores/notesStore';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';

interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  courseId: string;
  currentTime: number;
  onSeekTo: (seconds: number) => void;
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function NotesDrawer({
  isOpen,
  onClose,
  lessonId,
  courseId,
  currentTime,
  onSeekTo,
}: NotesDrawerProps) {
  const { getNotesByLesson, addNote, updateNote, deleteNote } = useNotesStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const notes = getNotesByLesson(lessonId);

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNote({
        lessonId,
        courseId,
        timestamp: currentTime,
        content: newNote.trim(),
      });
      setNewNote('');
      setIsAdding(false);
    }
  };

  const handleUpdateNote = (id: string) => {
    if (editContent.trim()) {
      updateNote(id, editContent.trim());
      setEditingId(null);
      setEditContent('');
    }
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Delete this note?')) {
      deleteNote(id);
    }
  };

  const startEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-surface-light border-l border-white/10 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-white font-semibold">Notes</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Close notes"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Add Note Button */}
      <div className="p-4 border-b border-white/10">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Note at {formatTimestamp(currentTime)}
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your note... (Markdown supported)"
              className="w-full px-3 py-2 bg-surface border border-white/10 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="flex-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewNote('');
                }}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/40 text-sm">No notes yet</p>
            <p className="text-white/30 text-xs mt-1">Click "Add Note" to create one</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-surface/50 border border-white/5 rounded-lg p-3 hover:border-white/10 transition-colors"
            >
              {/* Timestamp */}
              <button
                onClick={() => onSeekTo(note.timestamp)}
                className="text-primary-400 text-xs font-mono hover:text-primary-300 transition-colors mb-2"
              >
                {formatTimestamp(note.timestamp)}
              </button>

              {/* Content */}
              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-2 py-1.5 bg-surface border border-white/10 rounded text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateNote(note.id)}
                      className="p-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded transition-colors"
                      aria-label="Save note"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 rounded transition-colors"
                      aria-label="Cancel edit"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-white/80 text-sm whitespace-pre-wrap">{note.content}</p>
              )}

              {/* Actions */}
              {editingId !== note.id && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => startEdit(note.id, note.content)}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    aria-label="Edit note"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-white/40 hover:text-white/60" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                    aria-label="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white/40 hover:text-red-400" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
