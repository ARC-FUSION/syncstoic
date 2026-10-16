import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown, Check, X } from 'lucide-react';
import { getAllTags, seedCourses } from '../lib/data/seed';
import type { Difficulty, SortOption } from '../lib/types';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { GridSkeleton } from '../components/ui/loaders';
import { PageTransition } from '../components/ui/PageTransition';
import CourseCard, { difficultyLabel } from '../components/course/CourseCard';

const difficulties: Difficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'duration', label: 'Duration' },
];

function isDifficulty(value: string | null): value is Difficulty {
  return value === 'BEGINNER' || value === 'INTERMEDIATE' || value === 'ADVANCED';
}

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const query = searchParams.get('q') ?? '';
  const difficultyParam = searchParams.get('difficulty');
  const difficulty = isDifficulty(difficultyParam) ? difficultyParam : null;
  const tag = searchParams.get('tag') ?? '';
  const sort = (searchParams.get('sort') as SortOption) || 'newest';

  const allTags = useMemo(() => getAllTags(), []);

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams(new URLSearchParams());

  const filteredCourses = useMemo(() => {
    let result = [...seedCourses];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(q) ||
          course.instructor.toLowerCase().includes(q) ||
          course.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (difficulty) {
      result = result.filter((course) => course.difficulty === difficulty);
    }

    if (tag) {
      result = result.filter((course) => course.tags.includes(tag));
    }

    switch (sort) {
      case 'popular':
        result.sort((a, b) => b.enrolledCount - a.enrolledCount);
        break;
      case 'duration':
        result.sort((a, b) => b.totalDurationSec - a.totalDurationSec);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [query, difficulty, tag, sort]);

  const hasActiveFilters = Boolean(query || difficulty || tag);

  return (
    <PageTransition>
      <div className="min-h-screen bg-surface pb-20 md:pb-0">
        <div className="border-b border-white/5 bg-surface-light/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Course Catalog</h1>
            <p className="mt-1 text-sm text-white/60 sm:text-base">
              Structured courses built from the best YouTube tutorials
            </p>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Filters */}
        <div className="space-y-4 mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search courses, instructors, or tags..."
              value={query}
              onChange={(e) => updateFilter('q', e.target.value)}
              className="w-full bg-surface-light border border-white/10 rounded-xl pl-12 pr-4 py-3 sm:py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all min-h-[48px]"
              aria-label="Search courses"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
            {/* Difficulty Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-white/40" strokeWidth={2} />
                <span className="text-white/60 text-sm font-medium">Difficulty:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilter('difficulty', '')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[40px] ${
                    !difficulty
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                      : 'bg-surface-light text-white/60 hover:text-white hover:bg-surface-lighter border border-white/5'
                  }`}
                  aria-label="Show all difficulties"
                >
                  <X className="h-4 w-4" />
                </button>
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => updateFilter('difficulty', diff)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize min-h-[40px] ${
                      difficulty === diff
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                        : 'bg-surface-light text-white/60 hover:text-white hover:bg-surface-lighter border border-white/5'
                    }`}
                    aria-label={`Filter by ${diff} difficulty`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-white/60 text-sm font-medium">Tag:</span>
              <select
                value={tag}
                onChange={(e) => updateFilter('tag', e.target.value)}
                className="flex-1 sm:flex-none bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all min-h-[40px]"
                aria-label="Filter by tag"
              >
                <option value="">All Tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="sm:ml-auto relative w-full sm:w-auto">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-sm text-white hover:bg-surface-lighter transition-all min-h-[40px]"
                aria-label="Sort courses"
                aria-expanded={showSortDropdown}
              >
                <div className="flex items-center gap-2">
                  <span className="text-white/60">Sort:</span>
                  <span className="font-medium">
                    {sortOptions.find((o) => o.value === sort)?.label}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} strokeWidth={2} />
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 top-full mt-2 bg-surface-light border border-white/10 rounded-lg overflow-hidden shadow-xl z-10 min-w-[150px]">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        updateFilter('sort', option.value);
                        setShowSortDropdown(false);
                      }}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/5 transition-colors ${
                        sort === option.value ? 'text-primary-400 font-medium' : 'text-white/70'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-white/40 text-sm">
            {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
          </p>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <GridSkeleton count={6} />
        ) : filteredCourses.length > 0 ? (
          <StaggerContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <StaggerItem key={course.id}>
              <Link
                key={course.id}
                to={`/course/${course.slug}`}
                className="group bg-surface-light border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={getYouTubeThumbnail(course.modules[0]?.lessons[0]?.youtubeVideoId || 'dQw4w9WgXcQ')}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Difficulty Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${getDifficultyColor(
                        course.difficulty
                      )}`}
                    >
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white/90 text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                    {formatDuration(course.totalDuration)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-2 group-hover:text-primary-300 transition-colors mb-2">
                    {course.title}
                  </h3>
                  <p className="text-white/40 text-xs sm:text-sm mb-3">{course.instructor}</p>
                  <p className="text-white/30 text-xs line-clamp-2 mb-4">{course.description}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" strokeWidth={2} />
                        {course.lessonCount} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" strokeWidth={2} />
                        {formatNumber(course.enrollCount)}
                      </span>
                    </div>
                  </div>

          {isLoading ? (
            <GridSkeleton count={6} />
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card className="border-white/5 bg-surface-light text-white ring-white/5">
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
                  <Search className="h-9 w-9 text-white/20" />
                </div>
                <h3 className="text-lg font-semibold text-white">No courses found</h3>
                <p className="max-w-sm text-sm text-white/40">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
