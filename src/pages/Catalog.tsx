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

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          {/* Search + sort */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                type="text"
                value={query}
                onChange={(e) => updateFilter('q', e.target.value)}
                placeholder="Search courses, instructors or tags..."
                aria-label="Search courses"
                className="h-10 border-white/10 bg-surface-light pl-9 text-white placeholder:text-white/30"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => updateFilter('q', '')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 w-full justify-between border-white/10 bg-surface-light text-white/80 hover:bg-surface-lighter sm:w-44"
                  aria-label="Sort courses"
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    {sortOptions.find((option) => option.value === sort)?.label}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-surface-light text-white ring-white/10">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuRadioGroup
                  value={sort}
                  onValueChange={(value) => updateFilter('sort', value)}
                >
                  {sortOptions.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                      className="focus:bg-white/10 focus:text-white"
                    >
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Difficulty chips */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-white/40">
              Difficulty
            </span>
            <Button
              size="sm"
              variant={difficulty === null ? 'default' : 'outline'}
              onClick={() => updateFilter('difficulty', '')}
              className={
                difficulty === null
                  ? 'rounded-full'
                  : 'rounded-full border-white/10 bg-surface-light text-white/70 hover:bg-surface-lighter hover:text-white'
              }
              aria-pressed={difficulty === null}
            >
              All
            </Button>
            {difficulties.map((diff) => (
              <Button
                key={diff}
                size="sm"
                variant={difficulty === diff ? 'default' : 'outline'}
                onClick={() => updateFilter('difficulty', diff)}
                className={
                  difficulty === diff
                    ? 'rounded-full'
                    : 'rounded-full border-white/10 bg-surface-light text-white/70 hover:bg-surface-lighter hover:text-white'
                }
                aria-pressed={difficulty === diff}
              >
                {difficultyLabel[diff]}
              </Button>
            ))}
          </div>

          {/* Tag chips */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-white/40">Tags</span>
            <Button
              size="sm"
              variant={tag === '' ? 'default' : 'outline'}
              onClick={() => updateFilter('tag', '')}
              className={
                tag === ''
                  ? 'rounded-full'
                  : 'rounded-full border-white/10 bg-surface-light text-white/70 hover:bg-surface-lighter hover:text-white'
              }
              aria-pressed={tag === ''}
            >
              All
            </Button>
            {allTags.map((t) => (
              <Button
                key={t}
                size="sm"
                variant={tag === t ? 'default' : 'outline'}
                onClick={() => updateFilter('tag', t)}
                className={
                  tag === t
                    ? 'rounded-full'
                    : 'rounded-full border-white/10 bg-surface-light text-white/70 hover:bg-surface-lighter hover:text-white'
                }
                aria-pressed={tag === t}
              >
                {t}
              </Button>
            ))}
          </div>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-white/40" aria-live="polite">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
            </p>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white/50 hover:text-white">
                Clear filters
              </Button>
            )}
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
