import type { ParsedContent } from '../types';

const URL_REGEX = /https?:\/\/[^\s)>\]]+/g;

export function parseNoteContent(content: string): ParsedContent {
  const codeExamples: { language: string; code: string }[] = [];
  const practiceQuestions: string[] = [];
  const resources: { type: string; label: string; url: string }[] = [];
  const seenUrls = new Set<string>();

  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    codeExamples.push({ language: match[1] || 'text', code: match[2].trim() });
  }

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(practice|question|q\d*[:.)])/i.test(trimmed) || trimmed.startsWith('? ')) {
      practiceQuestions.push(trimmed.replace(/^(practice|question|q\d*[:.)]\s*)/i, '').trim());
    }
  }

  const urls = content.match(URL_REGEX) ?? [];
  for (const url of urls) {
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);
    let type = 'Article';
    let label = 'Resource';
    if (/youtube\.com|youtu\.be/i.test(url)) {
      type = 'YouTube';
      label = 'Video Tutorial';
    } else if (/github\.com/i.test(url)) {
      type = 'GitHub';
      label = 'Repository';
    } else if (/\.pdf(\?|$)/i.test(url)) {
      type = 'PDF';
      label = 'PDF Document';
    } else if (/docs\.|documentation|developer\.|mozilla\.org|react\.dev|nodejs\.org/i.test(url)) {
      type = 'Documentation';
      label = 'Official Documentation';
    }
    resources.push({ type, label, url });
  }

  if (resources.length === 0) {
    resources.push(
      { type: 'Documentation', label: 'Official Documentation', url: '#' },
      { type: 'YouTube', label: 'Video Tutorial', url: '#' },
      { type: 'Article', label: 'Recommended Article', url: '#' },
      { type: 'GitHub', label: 'Example Repository', url: '#' }
    );
  }

  return { markdown: content, codeExamples, resources, practiceQuestions };
}
