import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { seedCourses } from '../lib/data/seed';
import { Difficulty, SortOption } from '../lib/types';
import { formatDuration, formatNumber, getYouTubeThumbnail } from '../lib/utils';
import { Search, Filter, Clock, BookOpen, Users, ChevronDown } from 'lucide-react';
import { GridSkeleton } from '../components/ui/Skeleton';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/ui/PageTransition';

const difficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'duration', label: 'Duration' },
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Read filters from URL
  const query = searchParams.get('q') || '';
  const difficulty = (searchParams.get('difficulty') as Difficulty) || '';
  const tag = searchParams.get('tag') || '';
  const sort = (searchParams.get('sort') as SortOption) || 'newest';

  // Update URL params
  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    seedCourses.forEach(course => course.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, []);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = [...seedCourses];

    // Search filter
    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        course =>
          course.title.toLowerCase().includes(lowerQuery) ||
          course.description.toLowerCase().includes(lowerQuery) ||
          course.instructor.toLowerCase().includes(lowerQuery) ||
          course.tags.some(t => t.toLowerCase().includes(lowerQuery))
      );
    }

    // Difficulty filter
    if (difficulty) {
      result = result.filter(course => course.difficulty === difficulty);
    }

    // Tag filter
    if (tag) {
      result = result.filter(course => course.tags.includes(tag));
    }

    // Sort
    switch (sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        result.sort((a, b) => b.enrollCount - a.enrollCount);
        break;
      case 'duration':
        result.sort((a, b) => b.totalDuration - a.totalDuration);
        break;
    }

    return result;
  }, [query, difficulty, tag, sort]);

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'beginner':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-surface pb-20 md:pb-0">
        {/* Header */}
        <div className="border-b border-white/5 bg-surface-light/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Course Catalog</h1>
            <p className="text-white/60 text-sm sm:text-base">
              Discover structured courses from YouTube playlists
            </p>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Filters */}
        <div className="space-y-4 mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search courses, instructors, or tags..."
              value={query}
              onChange={(e) => updateFilter('q', e.target.value)}
              className="w-full bg-surface-light border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
              aria-label="Search courses"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Difficulty Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/40" />
              <span className="text-white/60 text-sm">Difficulty:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => updateFilter('difficulty', '')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    !difficulty
                      ? 'bg-primary-600 text-white'
                      : 'bg-surface-light text-white/60 hover:text-white hover:bg-surface-lighter border border-white/5'
                  }`}
                  aria-label="Show all difficulties"
                >
                  All
                </button>
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => updateFilter('difficulty', diff)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                      difficulty === diff
                        ? 'bg-primary-600 text-white'
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
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">Tag:</span>
              <select
                value={tag}
                onChange={(e) => updateFilter('tag', e.target.value)}
                className="bg-surface-light border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-all"
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
            <div className="ml-auto relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 bg-surface-light border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white hover:bg-surface-lighter transition-all"
                aria-label="Sort courses"
                aria-expanded={showSortDropdown}
              >
                <span className="text-white/60">Sort:</span>
                <span className="font-medium">
                  {sortOptions.find((o) => o.value === sort)?.label}
                </span>
                <ChevronDown className="w-4 h-4" />
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
          </div>
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
                className="group bg-surface-light border border-white/5 rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={getYouTubeThumbnail(course.modules[0]?.lessons[0]?.youtubeVideoId || 'dQw4w9WgXcQ')}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Difficulty Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${getDifficultyColor(
                        course.difficulty
                      )}`}
                    >
                      {course.difficulty}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white/90 text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(course.totalDuration)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-white font-semibold line-clamp-2 group-hover:text-primary-300 transition-colors mb-2">
                    {course.title}
                  </h3>
                  <p className="text-white/40 text-sm mb-3">{course.instructor}</p>
                  <p className="text-white/30 text-xs line-clamp-2 mb-4">{course.description}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {course.lessonCount} lessons
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {formatNumber(course.enrollCount)}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {course.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-white/5 text-white/40 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-surface-light rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No courses found</h3>
            <p className="text-white/40 text-sm mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => setSearchParams(new URLSearchParams())}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
      </div>
    </PageTransition>
  );
}
