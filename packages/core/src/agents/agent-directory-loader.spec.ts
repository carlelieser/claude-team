/**
 * Tests for the agent directory loader
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  loadAgentsFromDirectory,
  listAgentFiles,
  getAgentIdFromFileName,
} from './agent-directory-loader.js';

describe('AgentDirectoryLoader', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `agent-loader-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  const createAgentFile = async (
    name: string,
    content: string
  ): Promise<string> => {
    const filePath = join(testDir, name);
    await writeFile(filePath, content, 'utf-8');
    return filePath;
  };

  const validAgentMarkdown = `---
id: test-agent
name: Test Agent
description: A test agent for unit tests
triggers:
  - event: test.event
    action: test_action
trustLevel: medium
maxTurns: 10
---

# Test Agent

You are a test agent.
`;

  describe('loadAgentsFromDirectory', () => {
    it('should load agents from directory', async () => {
      await createAgentFile('test-agent.md', validAgentMarkdown);

      const result = await loadAgentsFromDirectory(testDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.loaded).toHaveLength(1);
        expect(result.value.loaded[0]?.id).toBe('test-agent');
        expect(result.value.loaded[0]?.name).toBe('Test Agent');
        expect(result.value.failed).toHaveLength(0);
      }
    });

    it('should load multiple agents', async () => {
      await createAgentFile('agent1.md', validAgentMarkdown);
      await createAgentFile(
        'agent2.md',
        validAgentMarkdown.replace(/test-agent/g, 'agent2').replace('Test Agent', 'Agent 2')
      );

      const result = await loadAgentsFromDirectory(testDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.loaded).toHaveLength(2);
      }
    });

    it('should ignore non-markdown files', async () => {
      await createAgentFile('test-agent.md', validAgentMarkdown);
      await createAgentFile('notes.txt', 'Some notes');
      await createAgentFile('config.json', '{}');

      const result = await loadAgentsFromDirectory(testDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.loaded).toHaveLength(1);
      }
    });

    it('should track failed loads', async () => {
      await createAgentFile('test-agent.md', validAgentMarkdown);
      await createAgentFile(
        'invalid-agent.md',
        `---
name: Invalid Agent
---
Missing required fields
`
      );

      const result = await loadAgentsFromDirectory(testDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.loaded).toHaveLength(1);
        expect(result.value.failed).toHaveLength(1);
        expect(result.value.failed[0]?.path).toContain('invalid-agent.md');
      }
    });

    it('should support .markdown extension', async () => {
      await createAgentFile('test-agent.markdown', validAgentMarkdown);

      const result = await loadAgentsFromDirectory(testDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.loaded).toHaveLength(1);
      }
    });

    it('should handle empty directory', async () => {
      const result = await loadAgentsFromDirectory(testDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.loaded).toHaveLength(0);
        expect(result.value.failed).toHaveLength(0);
      }
    });

    it('should fail for non-existent directory', async () => {
      const result = await loadAgentsFromDirectory('/non/existent/path');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('unknown');
      }
    });

    it('should support recursive loading', async () => {
      const subDir = join(testDir, 'subdir');
      await mkdir(subDir, { recursive: true });

      await createAgentFile('agent1.md', validAgentMarkdown);
      await writeFile(
        join(subDir, 'agent2.md'),
        validAgentMarkdown.replace(/test-agent/g, 'agent2'),
        'utf-8'
      );

      const result = await loadAgentsFromDirectory(testDir, { recursive: true });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.loaded).toHaveLength(2);
      }
    });

    it('should not recurse by default', async () => {
      const subDir = join(testDir, 'subdir');
      await mkdir(subDir, { recursive: true });

      await createAgentFile('agent1.md', validAgentMarkdown);
      await writeFile(
        join(subDir, 'agent2.md'),
        validAgentMarkdown.replace(/test-agent/g, 'agent2'),
        'utf-8'
      );

      const result = await loadAgentsFromDirectory(testDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.loaded).toHaveLength(1);
      }
    });
  });

  describe('listAgentFiles', () => {
    it('should list markdown files', async () => {
      await createAgentFile('agent1.md', validAgentMarkdown);
      await createAgentFile('agent2.md', validAgentMarkdown);
      await createAgentFile('notes.txt', 'notes');

      const result = await listAgentFiles(testDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value.every((f) => f.endsWith('.md'))).toBe(true);
      }
    });

    it('should support custom extensions', async () => {
      await createAgentFile('agent.md', validAgentMarkdown);
      await createAgentFile('agent.yaml', 'yaml content');

      const result = await listAgentFiles(testDir, { extensions: ['.yaml'] });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]).toContain('.yaml');
      }
    });

    it('should handle empty directory', async () => {
      const result = await listAgentFiles(testDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(0);
      }
    });
  });

  describe('getAgentIdFromFileName', () => {
    it('should extract ID from markdown file', () => {
      expect(getAgentIdFromFileName('my-agent.md')).toBe('my-agent');
    });

    it('should handle .markdown extension', () => {
      expect(getAgentIdFromFileName('agent.markdown')).toBe('agent');
    });

    it('should handle paths', () => {
      expect(getAgentIdFromFileName('/path/to/agent.md')).toBe('agent');
    });

    it('should handle files without extension', () => {
      expect(getAgentIdFromFileName('agent')).toBe('agent');
    });
  });
});
