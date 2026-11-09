// src/jobs/scheduler.js
import cron from 'node-cron';
import config from '../config/env.js';
import logger from '../utils/logger.js';
import {
  autoCompleteOverdueSessions,
  autoCancelStaleSessions,
} from './sessionCleanup.jobs.js';

export function initScheduledJobs() {
  if (config.env === 'test') {
    logger.info('Skipping cron jobs in test environment');
    return;
  }

  logger.info('Initializing cron jobs');

  // Example schedule: every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    logger.debug('Cron: running autoCompleteOverdueSessions');
    try {
      await autoCompleteOverdueSessions();
    } catch (err) {
      logger.error({ err }, 'Cron error: autoCompleteOverdueSessions');
    }
  });

  // Example schedule: every hour
  cron.schedule('0 * * * *', async () => {
    logger.debug('Cron: running autoCancelStaleSessions');
    try {
      await autoCancelStaleSessions();
    } catch (err) {
      logger.error({ err }, 'Cron error: autoCancelStaleSessions');
    }
  });
}