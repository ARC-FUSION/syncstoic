import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstructorStore } from '../../lib/stores/instructorStore';
import { ArrowLeft } from 'lucide-react';
import type { Difficulty } from '../../lib/types';

export default function CreateCourse() {
  const navigate = useNavigate();
  const { addCourse } = useInstructorStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('BEGINNER');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    const courseId = addCourse({
      slug,
      title,
      description,
      thumbnailUrl: `https://picsum.photos/seed/${slug}/800/450`,
      instructor: 'You',
      difficulty,
      tags,
      modules: [],
      lessonCount: 0,
      totalDurationSec: 0,
      enrolledCount: 0,
      rating: 0,
      status: 'draft',
      instructorId: 'current-user',
    });

    navigate(`/instructor/courses/${courseId}`);
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/instructor/courses')}
          className="text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Create New Course</h1>
          <p className="text-white/60 mt-1">Fill in the course details to get started</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-light border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Course Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Complete React Developer Course"
                className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn in this course..."
                rows={4}
                className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-400"
                    >
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
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tag and press Enter..."
                  className="flex-1 px-4 py-2 bg-surface border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors font-medium"
          >
            Create Course
          </button>
          <button
            type="button"
            onClick={() => navigate('/instructor/courses')}
            className="px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
