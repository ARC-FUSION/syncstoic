import { useState } from 'react';
import { Link } from 'react-router-dom';
import { courses, categories } from '../data/courses';
import { Search, Clock, BookOpen, Play } from 'lucide-react';

export default function Catalog() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = courses.filter(course => {
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Course Catalog</h1>
        <p className="text-white/50">Discover structured courses from YouTube playlists</p>

        {/* Search */}
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            placeholder="Search courses, instructors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-light border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-light text-white/60 hover:text-white hover:bg-surface-lighter border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <Link
              key={course.id}
              to={`/course/${course.id}`}
              className="group bg-surface-light border border-white/5 rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-primary-600/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="bg-black/60 backdrop-blur-sm text-white/90 text-xs px-2.5 py-1 rounded-lg font-medium">
                    {course.category}
                  </span>
                </div>
                {course.enrolled && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-500/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg font-medium">
                      Enrolled
                    </span>
                  </div>
                )}
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white/90 text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(course.totalDuration)}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-white font-semibold line-clamp-2 group-hover:text-primary-300 transition-colors">
                  {course.title}
                </h3>
                <p className="text-white/40 text-sm mt-1">{course.instructor}</p>
                <p className="text-white/30 text-xs mt-2 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <span className="text-white/40 text-xs flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons
                  </span>
                  {course.enrolled ? (
                    <span className="text-primary-400 text-xs font-medium">{course.progress}% done</span>
                  ) : (
                    <span className="text-white/40 text-xs">Start learning →</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-white/40 text-lg">No courses found</p>
            <p className="text-white/20 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
