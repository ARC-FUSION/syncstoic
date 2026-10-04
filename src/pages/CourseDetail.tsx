import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courses } from '../data/courses';
import { Course, Lesson } from '../types';
import DistractionFreePlayer from '../components/player/DistractionFreePlayer';
import { isLessonCompleted } from '../hooks/useProgressTracking';
import { 
  ArrowLeft, CheckCircle2, Circle, Play, Clock, 
  ChevronDown, ChevronRight, Award
} from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [completedLessonsLocal, setCompletedLessonsLocal] = useState<Set<string>>(new Set());

  useEffect(() => {
    const found = courses.find(c => c.id === id);
    if (found) {
      setCourse(found);
      // Find the lesson to resume
      const allLessons = found.modules.flatMap(m => m.lessons);
      const resumeLesson = found.lastWatchedLessonId 
        ? allLessons.find(l => l.id === found.lastWatchedLessonId) || allLessons.find(l => !l.completed)
        : allLessons.find(l => !l.completed);
      if (resumeLesson) {
        setActiveLesson(resumeLesson);
      } else {
        setActiveLesson(allLessons[0]);
      }
      // Expand all modules by default
      setExpandedModules(new Set(found.modules.map(m => m.id)));
    }
  }, [id]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!course || !activeLesson) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-white/40">Loading course...</div>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = course.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.completed || completedLessonsLocal.has(l.id)).length, 0);
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  const getLessonStatus = (lesson: Lesson) => {
    if (lesson.completed || completedLessonsLocal.has(lesson.id)) return 'completed';
    if (lesson.id === activeLesson.id) return 'active';
    if (isLessonCompleted(course.id, lesson.id)) return 'completed';
    return 'locked';
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-white/60" />
            </Link>
            <div>
              <h1 className="text-white font-semibold text-sm truncate max-w-[300px]">{course.title}</h1>
              <p className="text-white/40 text-xs">{course.instructor}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="text-white/50 text-xs">{overallProgress}%</span>
            </div>
            {overallProgress === 100 && (
              <div className="flex items-center gap-1 text-amber-400">
                <Award className="w-4 h-4" />
                <span className="text-xs font-medium">Complete!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Player Section */}
          <div className="flex-1 lg:max-w-[calc(100%-380px)]">
            <div className="sticky top-[57px]">
              <DistractionFreePlayer
                videoId={activeLesson.youtubeId}
                courseId={course.id}
                lessonId={activeLesson.id}
                title={activeLesson.title}
              />
              {/* Lesson info below player */}
              <div className="px-4 py-4 border-b border-white/5">
                <h2 className="text-white font-semibold text-lg">{activeLesson.title}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-white/40 text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {Math.floor(activeLesson.duration / 60)} min
                  </span>
                  {activeLesson.completed && (
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Lesson List */}
          <div className="lg:w-[380px] border-l border-white/5 bg-surface-light/30">
            <div className="sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
              <div className="p-4 border-b border-white/5">
                <h3 className="text-white font-semibold text-sm">Course Content</h3>
                <p className="text-white/40 text-xs mt-1">
                  {completedLessons} of {totalLessons} lessons • {overallProgress}% complete
                </p>
              </div>

              {course.modules.map((module, modIndex) => (
                <div key={module.id} className="border-b border-white/5">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className="w-4 h-4 text-white/40" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-white/40" />
                      )}
                      <span className="text-white/80 text-sm font-medium">
                        Module {modIndex + 1}: {module.title}
                      </span>
                    </div>
                    <span className="text-white/30 text-xs">
                      {module.lessons.filter(l => l.completed).length}/{module.lessons.length}
                    </span>
                  </button>

                  {expandedModules.has(module.id) && (
                    <div className="pb-2">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const status = getLessonStatus(lesson);
                        
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleSelectLesson(lesson)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                              lesson.id === activeLesson.id
                                ? 'bg-primary-600/10 border-l-2 border-primary-500'
                                : 'hover:bg-white/5 border-l-2 border-transparent'
                            }`}
                          >
                            {/* Status icon */}
                            <div className="flex-shrink-0">
                              {status === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              ) : status === 'active' ? (
                                <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
                                  <Play className="w-2.5 h-2.5 text-primary-500 ml-0.5" fill="currentColor" />
                                </div>
                              ) : (
                                <Circle className="w-5 h-5 text-white/20" />
                              )}
                            </div>

                            {/* Lesson info */}
                            <div className="flex-1 text-left min-w-0">
                              <p className={`text-sm truncate ${
                                lesson.id === activeLesson.id ? 'text-primary-300 font-medium' : 'text-white/70'
                              }`}>
                                {lessonIndex + 1}. {lesson.title}
                              </p>
                              <p className="text-white/30 text-xs mt-0.5">
                                {Math.floor(lesson.duration / 60)} min
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
