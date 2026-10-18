// __tests__/utils/academic-linter.test.ts
import { describe, it, expect } from 'vitest';
import {
  lintAcademicText,
  calculateAcademicStyleScore,
  applyLintReplacement,
  ACADEMIC_LINT_RULES_EN,
  ACADEMIC_LINT_RULES_ID
} from '@/lib/editor/academic-linter';

describe('Phase 34: Academic Grammar & Style Linter Unit Tests', () => {
  it('detects English contractions and suggests formal expanded forms', () => {
    const text = "The experiment can't succeed if we don't calibrate the sensors.";
    const issues = lintAcademicText(text, 'en');

    expect(issues.length).toBe(2);
    expect(issues[0].matchedText.toLowerCase()).toBe("can't");
    expect(issues[0].type).toBe('contraction');
    expect(issues[0].suggestions).toContain('cannot');

    expect(issues[1].matchedText.toLowerCase()).toBe("don't");
    expect(issues[1].type).toBe('contraction');
    expect(issues[1].suggestions).toContain('do not');
  });

  it('detects English informal and imprecise vocabulary', () => {
    const text = 'The algorithm observed a lot of huge anomalies among the kids in the sample.';
    const issues = lintAcademicText(text, 'en');

    expect(issues.some((i) => i.matchedText.toLowerCase() === 'a lot of')).toBe(true);
    expect(issues.some((i) => i.matchedText.toLowerCase() === 'huge')).toBe(true);
    expect(issues.some((i) => i.matchedText.toLowerCase() === 'kids')).toBe(true);

    const kidsIssue = issues.find((i) => i.matchedText.toLowerCase() === 'kids');
    expect(kidsIssue?.suggestions).toContain('children');
  });

  it('detects English first-person bias and sweeping assumptions', () => {
    const text = 'Everyone knows that deep learning is effective. I found that accuracy improved.';
    const issues = lintAcademicText(text, 'en');

    const vague = issues.find((i) => i.type === 'vague');
    expect(vague).toBeDefined();
    expect(vague?.matchedText.toLowerCase()).toBe('everyone knows that');

    const firstPerson = issues.find((i) => i.type === 'first_person');
    expect(firstPerson).toBeDefined();
    expect(firstPerson?.matchedText.toLowerCase()).toBe('i found that');
    expect(firstPerson?.suggestions).toContain('the analysis revealed that');
  });

  it('detects Indonesian informal text abbreviations and colloquial slang', () => {
    const text = 'Metode ini tdk cocok krn hasil akurasinya jelek banget dan bikin error.';
    const issues = lintAcademicText(text, 'id');

    expect(issues.some((i) => i.matchedText.toLowerCase() === 'tdk')).toBe(true);
    expect(issues.some((i) => i.matchedText.toLowerCase() === 'krn')).toBe(true);
    expect(issues.some((i) => i.matchedText.toLowerCase() === 'banget')).toBe(true);
    expect(issues.some((i) => i.matchedText.toLowerCase() === 'bikin')).toBe(true);

    const tdkIssue = issues.find((i) => i.matchedText.toLowerCase() === 'tdk');
    expect(tdkIssue?.suggestions).toContain('tidak');

    const bangetIssue = issues.find((i) => i.matchedText.toLowerCase() === 'banget');
    expect(bangetIssue?.suggestions).toContain('sangat');
  });

  it('detects Indonesian first-person opinion and vague certainty', () => {
    const text = 'Menurut saya sudah jelas bahwa sistem ini pasti memberikan dampak positif.';
    const issues = lintAcademicText(text, 'id');

    expect(issues.some((i) => i.type === 'first_person')).toBe(true);
    expect(issues.some((i) => i.matchedText.toLowerCase() === 'sudah jelas bahwa')).toBe(true);
    expect(issues.some((i) => i.matchedText.toLowerCase() === 'pasti')).toBe(true);
  });

  it('calculates academic style formality score and grades accurately', () => {
    // Zero issues = 100 A
    const perfectScore = calculateAcademicStyleScore(0, 500);
    expect(perfectScore.score).toBe(100);
    expect(perfectScore.grade).toBe('A');

    // Moderate issues
    const moderateScore = calculateAcademicStyleScore(3, 100);
    expect(moderateScore.score).toBeLessThan(90);
    expect(moderateScore.grade).toBe('B');

    // Heavy issues
    const lowScore = calculateAcademicStyleScore(8, 100);
    expect(lowScore.score).toBeLessThan(75);
  });

  it('applies lint replacement without corrupting surrounding text', () => {
    const original = "It can't be deduced without evidence.";
    const issues = lintAcademicText(original, 'en');
    expect(issues.length).toBe(1);

    const replaced = applyLintReplacement(original, issues[0], 'cannot');
    expect(replaced).toBe('It cannot be deduced without evidence.');
  });

  it('strips HTML tags cleanly before executing linter rules', () => {
    const htmlText = '<p>The model <strong>don\'t</strong> converge easily.</p>';
    const issues = lintAcademicText(htmlText, 'en');

    expect(issues.length).toBe(1);
    expect(issues[0].matchedText.toLowerCase()).toBe("don't");
  });

  it('handles empty text and non-string inputs gracefully', () => {
    expect(lintAcademicText('', 'en')).toEqual([]);
    expect(lintAcademicText(null as any, 'en')).toEqual([]);
  });
});
