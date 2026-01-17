/**
 * Test setup file - runs before all tests
 */

import pino from 'pino';
import { setLogger } from './shared/logger.js';

// Create a silent logger for tests to avoid pino-pretty transport issues
const testLogger = pino({
  level: 'silent',
});

// Set the test logger as the default
setLogger(testLogger);
