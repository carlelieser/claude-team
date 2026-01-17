/**
 * Tests for the Claude CLI stream parser
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createStreamParser,
  type StreamParser,
  type ParsedMessage,
  type AssistantMessage,
  type ToolUseMessage,
  type ResultMessage,
  type ErrorMessage,
} from './stream-parser.js';

describe('StreamParser', () => {
  let parser: StreamParser;

  beforeEach(() => {
    parser = createStreamParser();
  });

  describe('parse', () => {
    it('should parse assistant message', () => {
      const messages: ParsedMessage[] = [];
      parser.on('message', (msg) => messages.push(msg));

      parser.parse('{"type":"assistant","content":"Hello, world!"}\n');

      expect(messages).toHaveLength(1);
      expect(messages[0]?.type).toBe('assistant');
      expect((messages[0] as AssistantMessage).content).toBe('Hello, world!');
    });

    it('should parse tool use message', () => {
      const messages: ParsedMessage[] = [];
      parser.on('message', (msg) => messages.push(msg));

      parser.parse(
        '{"type":"tool_use","id":"tool_123","name":"Read","input":{"file_path":"/test.txt"}}\n'
      );

      expect(messages).toHaveLength(1);
      expect(messages[0]?.type).toBe('tool_use');
      const toolUse = messages[0] as ToolUseMessage;
      expect(toolUse.toolId).toBe('tool_123');
      expect(toolUse.toolName).toBe('Read');
      expect(toolUse.input).toEqual({ file_path: '/test.txt' });
    });

    it('should parse tool result message', () => {
      const messages: ParsedMessage[] = [];
      parser.on('message', (msg) => messages.push(msg));

      parser.parse(
        '{"type":"tool_result","tool_use_id":"tool_123","output":"File contents here","is_error":false}\n'
      );

      expect(messages).toHaveLength(1);
      expect(messages[0]?.type).toBe('tool_result');
    });

    it('should parse result message with usage', () => {
      const messages: ParsedMessage[] = [];
      parser.on('message', (msg) => messages.push(msg));

      parser.parse(
        '{"type":"result","success":true,"usage":{"input_tokens":100,"output_tokens":50},"session_id":"sess_123"}\n'
      );

      expect(messages).toHaveLength(1);
      expect(messages[0]?.type).toBe('result');
      const result = messages[0] as ResultMessage;
      expect(result.success).toBe(true);
      expect(result.usage?.inputTokens).toBe(100);
      expect(result.usage?.outputTokens).toBe(50);
      expect(result.sessionId).toBe('sess_123');
    });

    it('should parse error message', () => {
      const messages: ParsedMessage[] = [];
      parser.on('message', (msg) => messages.push(msg));

      parser.parse(
        '{"type":"error","code":"rate_limit","message":"Rate limit exceeded"}\n'
      );

      expect(messages).toHaveLength(1);
      expect(messages[0]?.type).toBe('error');
      const error = messages[0] as ErrorMessage;
      expect(error.code).toBe('rate_limit');
      expect(error.message).toBe('Rate limit exceeded');
    });

    it('should handle multiple messages in one chunk', () => {
      const messages: ParsedMessage[] = [];
      parser.on('message', (msg) => messages.push(msg));

      parser.parse(
        '{"type":"assistant","content":"First"}\n{"type":"assistant","content":"Second"}\n'
      );

      expect(messages).toHaveLength(2);
      expect((messages[0] as AssistantMessage).content).toBe('First');
      expect((messages[1] as AssistantMessage).content).toBe('Second');
    });

    it('should handle chunked input across multiple parse calls', () => {
      const messages: ParsedMessage[] = [];
      parser.on('message', (msg) => messages.push(msg));

      parser.parse('{"type":"assistant"');
      expect(messages).toHaveLength(0);

      parser.parse(',"content":"Hello"}\n');
      expect(messages).toHaveLength(1);
      expect((messages[0] as AssistantMessage).content).toBe('Hello');
    });

    it('should skip empty lines', () => {
      const messages: ParsedMessage[] = [];
      parser.on('message', (msg) => messages.push(msg));

      parser.parse('\n\n{"type":"assistant","content":"Test"}\n\n');

      expect(messages).toHaveLength(1);
    });

    it('should emit parse error for invalid JSON', () => {
      const errors: { error: Error; line: string }[] = [];
      parser.on('parseError', (error, line) => errors.push({ error, line }));

      parser.parse('not valid json\n');

      expect(errors).toHaveLength(1);
      expect(errors[0]?.line).toBe('not valid json');
    });
  });

  describe('events', () => {
    it('should emit text event for assistant content', () => {
      const texts: string[] = [];
      parser.on('text', (text) => texts.push(text));

      parser.parse('{"type":"assistant","content":"Hello"}\n');
      parser.parse('{"type":"assistant","content":" world"}\n');

      expect(texts).toEqual(['Hello', ' world']);
    });

    it('should emit toolUse event for tool use messages', () => {
      const tools: ToolUseMessage[] = [];
      parser.on('toolUse', (tool) => tools.push(tool));

      parser.parse('{"type":"tool_use","id":"1","name":"Read","input":{}}\n');

      expect(tools).toHaveLength(1);
      expect(tools[0]?.toolName).toBe('Read');
    });

    it('should emit result event for result messages', () => {
      const results: ResultMessage[] = [];
      parser.on('result', (result) => results.push(result));

      parser.parse('{"type":"result","success":true}\n');

      expect(results).toHaveLength(1);
      expect(results[0]?.success).toBe(true);
    });

    it('should emit error event for error messages', () => {
      const errors: ErrorMessage[] = [];
      parser.on('error', (error) => errors.push(error));

      parser.parse('{"type":"error","code":"test","message":"Test error"}\n');

      expect(errors).toHaveLength(1);
      expect(errors[0]?.code).toBe('test');
    });
  });

  describe('getText', () => {
    it('should accumulate all assistant text', () => {
      parser.parse('{"type":"assistant","content":"Hello"}\n');
      parser.parse('{"type":"tool_use","id":"1","name":"Read","input":{}}\n');
      parser.parse('{"type":"assistant","content":" world"}\n');

      expect(parser.getText()).toBe('Hello world');
    });
  });

  describe('getMessages', () => {
    it('should return all parsed messages', () => {
      parser.parse('{"type":"assistant","content":"Test"}\n');
      parser.parse('{"type":"tool_use","id":"1","name":"Read","input":{}}\n');

      const messages = parser.getMessages();

      expect(messages).toHaveLength(2);
      expect(messages[0]?.type).toBe('assistant');
      expect(messages[1]?.type).toBe('tool_use');
    });
  });

  describe('reset', () => {
    it('should clear all state', () => {
      parser.parse('{"type":"assistant","content":"Test"}\n');

      expect(parser.getMessages()).toHaveLength(1);
      expect(parser.getText()).toBe('Test');

      parser.reset();

      expect(parser.getMessages()).toHaveLength(0);
      expect(parser.getText()).toBe('');
    });
  });

  describe('off', () => {
    it('should remove event listener', () => {
      const messages: ParsedMessage[] = [];
      const handler = (msg: ParsedMessage) => messages.push(msg);

      parser.on('message', handler);
      parser.parse('{"type":"assistant","content":"First"}\n');

      parser.off('message', handler);
      parser.parse('{"type":"assistant","content":"Second"}\n');

      expect(messages).toHaveLength(1);
    });
  });
});
