import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { seedCourses } from '../lib/data/seed';
import { Course, Lesson } from '../lib/types';
import { formatDuration, formatNumber, getYouTubeThumbnail } from '../lib/utils';
import YouTubePlayer from '../components/player/YouTubePlayer';
import {
  ArrowLeft,
  Play,
  Clock,
  BookOpen,
  Users,
  Lock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Award,
} from 'lucide-react';

const ENROLLMENT_KEY = 'syncfocus_enrollments';

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Load course data
  useEffect(() => {
    const found = seedCourses.find((c) => c.slug === slug);
    if (found) {
      setCourse(found);
      // Expand first module by default
      setExpandedModules(new Set([found.modules[0]?.id]));
      // Set first preview or first lesson as active
      const firstPreview = found.modules[0]?.lessons.find((l) => l.isPreview);
      setActiveLesson(firstPreview || found.modules[0]?.lessons[0]);
    }
  }, [slug]);

  // Check enrollment status
  useEffect(() => {
    if (!course) return;
    try {
      const enrollments = JSON.parse(localStorage.getItem(ENROLLMENT_KEY) || '{}');
      setIsEnrolled(!!enrollments[course.id]);
    } catch {
      setIsEnrolled(false);
    }
  }, [course]);

  // Load completed lessons from progress
  useEffect(() => {
    if (!course) return;
    try {
      const progress = JSON.parse(localStorage.getItem('syncfocus_progress') || '{}');
      const completed = new Set<string>();
      Object.entries(progress).forEach(([key, value]) => {
        const [courseId] = key.split('::');
        if (courseId === course.id && (value as { isCompleted: boolean }).isCompleted) {
          const lessonId = key.split('::')[1];
          completed.add(lessonId);
        }
      });
      setCompletedLessons(completed);
    } catch {
      setCompletedLessons(new Set());
    }
  }, [course]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleEnroll = () => {
    if (!course) return;
    try {
      const enrollments = JSON.parse(localStorage.getItem(ENROLLMENT_KEY) || '{}');
      enrollments[course.id] = {
        enrolledAt: new Date().toISOString(),
        progress: 0,
      };
      localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(enrollments));
      setIsEnrolled(true);
    } catch (error) {
      console.error('Failed to enroll:', error);
    }
  };

  const handleSelectLesson = (lesson: Lesson) => {
    // Check if lesson is locked
    if (!lesson.isPreview && !isEnrolled) {
      return;
    }
    setActiveLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-white/40">Loading course...</div>
      </div>
    );
  }

  const totalLessons = course.lessonCount;
  const completedCount = completedLessons.size;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/courses"
              className="p-2 hover:bg-white/5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
              aria-label="Back to catalog"
            >
              <ArrowLeft className="w-5 h-5 text-white/60" />
            </Link>
            <div>
              <h1 className="text-white font-semibold text-sm truncate max-w-[300px]">
                {course.title}
              </h1>
              <p className="text-white/40 text-xs">{course.instructor}</p>
            </div>
          </div>
          {isEnrolled && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-white/50 text-xs">{progressPercent}%</span>
              </div>
              {progressPercent === 100 && (
                <div className="flex items-center gap-1 text-amber-400">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-medium">Complete!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Player Section */}
          <div className="flex-1 lg:max-w-[calc(100%-380px)]">
            <div className="sticky top-[57px]">
              {/* Hero Section */}
              {!activeLesson && (
                <div className="relative aspect-video bg-surface-light overflow-hidden">
                  <img
                    src={getYouTubeThumbnail(
                      course.modules[0]?.lessons[0]?.youtubeVideoId || 'dQw4w9WgXcQ'
                    )}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <h2 className="text-white text-2xl sm:text-3xl font-bold mb-3 max-w-2xl">
                      {course.title}
                    </h2>
                    <p className="text-white/60 text-sm sm:text-base mb-4 max-w-xl">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-4 text-white/40 text-sm mb-6">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.lessonCount} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(course.totalDuration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {formatNumber(course.enrollCount)} students
                      </span>
                    </div>
                    {!isEnrolled ? (
                      <button
                        onClick={handleEnroll}
                        className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/20"
                      >
                        Enroll Now — Free
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const firstLesson = course.modules[0]?.lessons[0];
                          if (firstLesson) handleSelectLesson(firstLesson);
                        }}
                        className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/20 flex items-center gap-2"
                      >
                        <Play className="w-5 h-5" fill="white" />
                        Continue Learning
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Player */}
              {activeLesson && (
                <YouTubePlayer
                  videoId={activeLesson.youtubeVideoId}
                  courseId={course.id}
                  lessonId={activeLesson.id}
                  title={activeLesson.title}
                />
              )}

              {/* Lesson info below player */}
              {activeLesson && (
                <div className="px-4 py-4 border-b border-white/5">
                  <h2 className="text-white font-semibold text-lg">{activeLesson.title}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-white/40 text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(activeLesson.durationSec)}
                    </span>
                    {completedLessons.has(activeLesson.id) && (
                      <span className="text-green-400 text-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Lesson List */}
          <div className="lg:w-[380px] border-l border-white/5 bg-surface-light/30">
            <div className="sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
              {/* Course Info */}
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${getDifficultyColor(
                      course.difficulty
                    )}`}
                  >
                    {course.difficulty}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">Course Content</h3>
                <p className="text-white/40 text-xs">
                  {completedCount} of {totalLessons} lessons • {progressPercent}% complete
                </p>
              </div>

              {/* Modules */}
              {course.modules.map((module, modIndex) => (
                <div key={module.id} className="border-b border-white/5">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                    aria-expanded={expandedModules.has(module.id)}
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
                      {module.lessons.filter((l) => completedLessons.has(l.id)).length}/
                      {module.lessons.length}
                    </span>
                  </button>

                  {expandedModules.has(module.id) && (
                    <div className="pb-2">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const isLocked = !lesson.isPreview && !isEnrolled;
                        const isCompleted = completedLessons.has(lesson.id);
                        const isActive = activeLesson?.id === lesson.id;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleSelectLesson(lesson)}
                            disabled={isLocked}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                              isActive
                                ? 'bg-primary-600/10 border-l-2 border-primary-500'
                                : isLocked
                                ? 'opacity-50 cursor-not-allowed hover:bg-white/5'
                                : 'hover:bg-white/5 border-l-2 border-transparent'
                            }`}
                            aria-label={`${lesson.title}${isLocked ? ' (locked)' : ''}`}
                          >
                            {/* Status icon */}
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              ) : isLocked ? (
                                <Lock className="w-5 h-5 text-white/20" />
                              ) : isActive ? (
                                <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
                                  <Play
                                    className="w-2.5 h-2.5 text-primary-500 ml-0.5"
                                    fill="currentColor"
                                  />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                              )}
                            </div>

                            {/* Lesson info */}
                            <div className="flex-1 text-left min-w-0">
                              <p
                                className={`text-sm truncate ${
                                  isActive
                                    ? 'text-primary-300 font-medium'
                                    : isLocked
                                    ? 'text-white/40'
                                    : 'text-white/70'
                                }`}
                              >
                                {lessonIndex + 1}. {lesson.title}
                              </p>
                              <p className="text-white/30 text-xs mt-0.5 flex items-center gap-2">
                                <span>{formatDuration(lesson.durationSec)}</span>
                                {lesson.isPreview && (
                                  <span className="text-primary-400 text-xs">Preview</span>
                                )}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Enroll CTA if not enrolled */}
              {!isEnrolled && (
                <div className="p-4 border-t border-white/5 bg-surface-light/50">
                  <button
                    onClick={handleEnroll}
                    className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/20"
                  >
                    Enroll to Unlock All Lessons
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
