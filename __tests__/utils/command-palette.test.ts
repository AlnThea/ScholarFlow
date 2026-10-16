import { describe, it, expect } from 'vitest';
import {
  getAvailableCommands,
  filterCommands,
  COMMAND_CATEGORIES,
  type CommandItem,
} from '@/lib/editor/command-palette';

describe('Academic Command Palette & Shortcuts Engine (Phase 26)', () => {
  describe('getAvailableCommands', () => {
    it('returns an extensive list of academic commands in English', () => {
      const commands = getAvailableCommands('en');
      expect(commands.length).toBeGreaterThanOrEqual(15);

      const reviewerCmd = commands.find((c) => c.id === 'cmd_peer_review');
      expect(reviewerCmd).toBeDefined();
      expect(reviewerCmd?.title).toBe('Reviewer #2 Simulation');
      expect(reviewerCmd?.category).toBe('review');
      expect(reviewerCmd?.shortcut).toBe('Ctrl + Shift + R');
      expect(reviewerCmd?.tooltip).toContain('Reviewer #2 feedback');
    });

    it('returns commands localized in Indonesian with rich tooltips', () => {
      const commands = getAvailableCommands('id');
      const reviewerCmd = commands.find((c) => c.id === 'cmd_peer_review');
      expect(reviewerCmd).toBeDefined();
      expect(reviewerCmd?.title).toBe('Simulasi Reviewer #2');
      expect(reviewerCmd?.tooltip).toContain('persona Reviewer #2 yang kritis');

      const integrityCmd = commands.find((c) => c.id === 'cmd_integrity_barometer');
      expect(integrityCmd?.title).toBe('Barometer Integritas & Deteksi AI');
      expect(integrityCmd?.tooltip).toContain('orisinalitas');
    });

    it('ensures all commands have required properties and informative tooltips', () => {
      const commands = getAvailableCommands('en');
      for (const cmd of commands) {
        expect(cmd.id).toBeTruthy();
        expect(cmd.title).toBeTruthy();
        expect(cmd.description).toBeTruthy();
        expect(cmd.tooltip).toBeTruthy();
        expect(cmd.tooltip.length).toBeGreaterThan(20); // Must be a comprehensive explanation
        expect(cmd.category).toBeTruthy();
        expect(cmd.actionId).toBeTruthy();
        expect(Array.isArray(cmd.keywords)).toBe(true);
      }
    });
  });

  describe('filterCommands', () => {
    const mockCommands = getAvailableCommands('en');

    it('returns all commands when query is empty and category is all', () => {
      const results = filterCommands(mockCommands, '', 'all');
      expect(results.length).toBe(mockCommands.length);
    });

    it('filters commands strictly by category', () => {
      const reviewCommands = filterCommands(mockCommands, '', 'review');
      expect(reviewCommands.length).toBeGreaterThan(0);
      expect(reviewCommands.every((c) => c.category === 'review')).toBe(true);

      const citationCommands = filterCommands(mockCommands, '', 'citations');
      expect(citationCommands.length).toBeGreaterThan(0);
      expect(citationCommands.every((c) => c.category === 'citations')).toBe(true);
    });

    it('filters commands by title case-insensitively', () => {
      const results = filterCommands(mockCommands, 'ghostwriter', 'all');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].id).toBe('cmd_toggle_ghostwriter');
    });

    it('filters commands by keywords (e.g. Scopus, APA, LaTeX)', () => {
      const scopusResults = filterCommands(mockCommands, 'scopus', 'all');
      expect(scopusResults.some((c) => c.id === 'cmd_peer_review')).toBe(true);

      const mathResults = filterCommands(mockCommands, 'latex', 'all');
      expect(mathResults.some((c) => c.id === 'cmd_insert_math')).toBe(true);
    });

    it('combines category filter and search query accurately', () => {
      const results = filterCommands(mockCommands, 'apa', 'formatting');
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].id).toBe('cmd_style_apa');

      // 'apa' in 'ai' category should return nothing
      const noResults = filterCommands(mockCommands, 'apa', 'ai');
      expect(noResults.length).toBe(0);
    });

    it('handles non-existent search terms safely', () => {
      const results = filterCommands(mockCommands, 'xyznonexistent123', 'all');
      expect(results).toEqual([]);
    });
  });

  describe('COMMAND_CATEGORIES meta', () => {
    it('contains all valid category filters with bilingual labels', () => {
      expect(COMMAND_CATEGORIES.length).toBeGreaterThanOrEqual(7);
      expect(COMMAND_CATEGORIES[0].id).toBe('all');
      expect(COMMAND_CATEGORIES[0].labelEn).toBe('All Actions');
      expect(COMMAND_CATEGORIES[0].labelId).toBe('Semua Perintah');
    });
  });
});
