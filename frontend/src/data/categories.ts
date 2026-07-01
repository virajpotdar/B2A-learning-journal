import type { LearningCategory } from '../types';

export const LEARNING_CATEGORIES: LearningCategory[] = [
  {
    slug: 'frontend',
    title: 'Frontend',
    description: 'HTML, CSS, JavaScript, React, and modern UI development.',
    icon: 'Web',
    color: '#61DAFB',
    gradient: 'linear-gradient(135deg, #61DAFB 0%, #3178C6 100%)',
    aliases: ['Frontend', 'frontend'],
  },
  {
    slug: 'backend',
    title: 'Backend',
    description: 'Servers, APIs, authentication, and server-side architecture.',
    icon: 'Storage',
    color: '#68A063',
    gradient: 'linear-gradient(135deg, #68A063 0%, #2E7D32 100%)',
    aliases: ['Backend', 'backend'],
  },
  {
    slug: 'other',
    title: 'Other',
    description: 'Miscellaneous topics and cross-cutting engineering knowledge.',
    icon: 'MoreHoriz',
    color: '#ed771d',
    gradient: 'linear-gradient(135deg, #ed771d 0%, #f5a623 100%)',
    aliases: ['Other', 'other', 'General', 'general'],
  },
];

export function getCategoryBySlug(slug: string): LearningCategory | undefined {
  return LEARNING_CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryForNote(noteCategory: string): LearningCategory | undefined {
  const normalized = noteCategory.trim().toLowerCase();
  return LEARNING_CATEGORIES.find((c) =>
    c.aliases.some((a) => a.toLowerCase() === normalized) || c.slug === normalized
  );
}

export function getCategoryColor(category: string): string {
  return getCategoryForNote(category)?.color ?? '#ed771d';
}
