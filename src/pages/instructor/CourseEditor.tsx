import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useInstructorStore } from '../../lib/stores/instructorStore';
import { ArrowLeft, Plus, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Course, Module, Lesson } from '../../lib/types';

function SortableModule({
  module,
  courseId,
  onEdit,
  onDelete,
}: {
  module: Module;
  courseId: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: module.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-surface-light border border-white/10 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-white/40" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">{module.title}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="px-3 py-1 text-sm bg-white/5 text-white rounded hover:bg-white/10 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-sm text-white/60 mb-3">{module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}</p>
          <div className="space-y-2">
            {module.lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center gap-2 p-2 bg-surface rounded border border-white/5">
                <span className="text-sm text-white/80 flex-1">{lesson.title}</span>
                {lesson.isPreview && (
                  <span className="text-xs px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded">Preview</span>
                )}
                <span className="text-xs text-white/40">{Math.floor(lesson.durationSec / 60)}m</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, updateCourse, addModule, updateModule, deleteModule, reorderModules, addLesson, updateLesson, deleteLesson } = useInstructorStore();
  
  const course = courses.find((c) => c.id === id);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson: Lesson } | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonVideoId, setLessonVideoId] = useState('');
  const [lessonDuration, setLessonDuration] = useState(0);
  const [lessonIsPreview, setLessonIsPreview] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setTags(course.tags);
    }
  }, [course]);

  if (!course) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-white mb-4">Course Not Found</h2>
          <Link to="/instructor/courses" className="text-primary-400 hover:text-primary-300">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveMetadata = () => {
    updateCourse(course.id, { title, description, tags });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddModule = () => {
    setModuleTitle('');
    setEditingModule({ id: 'new', title: '', order: course.modules.length, lessons: [] });
  };

  const handleSaveModule = () => {
    if (!moduleTitle.trim()) return;
    
    if (editingModule?.id === 'new') {
      addModule(course.id, {
        title: moduleTitle,
        order: course.modules.length,
        lessons: [],
      });
    } else if (editingModule) {
      updateModule(course.id, editingModule.id, { title: moduleTitle });
    }
    setEditingModule(null);
    setModuleTitle('');
  };

  const handleDeleteModule = (moduleId: string) => {
    if (confirm('Delete this module and all its lessons?')) {
      deleteModule(course.id, moduleId);
    }
  };

  const handleAddLesson = (moduleId: string) => {
    setLessonTitle('');
    setLessonVideoId('');
    setLessonDuration(0);
    setLessonIsPreview(false);
    setEditingLesson({ moduleId, lesson: { id: 'new', title: '', youtubeVideoId: '', durationSec: 0, order: 0, isPreview: false, isCompleted: false } });
  };

  const handleSaveLesson = () => {
    if (!editingLesson || !lessonTitle.trim() || !lessonVideoId.trim()) return;

    const moduleId = editingLesson.moduleId;
    const module = course.modules.find((m) => m.id === moduleId);
    if (!module) return;

    if (editingLesson.lesson.id === 'new') {
      addLesson(course.id, moduleId, {
        title: lessonTitle,
        youtubeVideoId: lessonVideoId,
        durationSec: lessonDuration * 60,
        order: module.lessons.length,
        isPreview: lessonIsPreview,
        isCompleted: false,
      });
    } else {
      updateLesson(course.id, moduleId, editingLesson.lesson.id, {
        title: lessonTitle,
        youtubeVideoId: lessonVideoId,
        durationSec: lessonDuration * 60,
        isPreview: lessonIsPreview,
      });
    }
    setEditingLesson(null);
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    deleteLesson(course.id, moduleId, lessonId);
  };

  const handleModuleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = course.modules.findIndex((m) => m.id === active.id);
    const newIndex = course.modules.findIndex((m) => m.id === over.id);
    const newModules = arrayMove(course.modules, oldIndex, newIndex);
    reorderModules(course.id, newModules.map((m) => m.id));
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/instructor/courses" className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Course</h1>
          <p className="text-white/60 mt-1">Manage course content and structure</p>
        </div>
      </div>

      {/* Course Metadata */}
      <div className="bg-surface-light border border-white/10 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Course Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-400">
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
                className="flex-1 px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
          <button
            onClick={handleSaveMetadata}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Modules */}
      <div className="bg-surface-light border border-white/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Modules & Lessons</h2>
          <button
            onClick={handleAddModule}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Module
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
          <SortableContext items={course.modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            {course.modules.map((module) => (
              <SortableModule
                key={module.id}
                module={module}
                courseId={course.id}
                onEdit={() => {
                  setEditingModule(module);
                  setModuleTitle(module.title);
                }}
                onDelete={() => handleDeleteModule(module.id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Module Modal */}
        {editingModule && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface-light border border-white/10 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingModule.id === 'new' ? 'Add Module' : 'Edit Module'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Module Title</label>
                  <input
                    type="text"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveModule}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingModule(null)}
                    className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lesson Modal */}
        {editingLesson && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface-light border border-white/10 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingLesson.lesson.id === 'new' ? 'Add Lesson' : 'Edit Lesson'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Lesson Title</label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">YouTube Video ID</label>
                  <input
                    type="text"
                    value={lessonVideoId}
                    onChange={(e) => setLessonVideoId(e.target.value)}
                    placeholder="e.g., dQw4w9WgXcQ"
                    className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(Number(e.target.value))}
                    min="1"
                    className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPreview"
                    checked={lessonIsPreview}
                    onChange={(e) => setLessonIsPreview(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPreview" className="text-sm text-white/80">
                    Mark as preview (free lesson)
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveLesson}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingLesson(null)}
                    className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
