// src/jobs/sessionCleanup.job.js
import Session from '../models/session.model.js';
import logger from '../utils/logger.js';

/**
 * Auto-complete sessions where end time has passed and still 'scheduled'.
 * endTime = scheduledAt + durationMinutes
 */
export async function autoCompleteOverdueSessions() {
  const now = new Date();

  // Use Mongo $expr to compute endTime and compare to now
  const filter = {
    status: 'scheduled',
    $expr: {
      $lte: [
        {
          $add: [
            '$scheduledAt',
            { $multiply: ['$durationMinutes', 60000] }, // minutes -> ms
          ],
        },
        now,
      ],
    },
  };

  const update = {
    $set: {
      status: 'completed',
      statusReason: 'auto_completed_by_cron',
    },
  };

  const result = await Session.updateMany(filter, update);

  if (result.modifiedCount > 0) {
    logger.info(
      {
        modified: result.modifiedCount,
      },
      'Auto-completed overdue sessions'
    );
  }
}

/**
 * Auto-cancel very old scheduled sessions.
 * Example: scheduledAt < now - 24h and still 'scheduled'
 */
export async function autoCancelStaleSessions() {
  const now = new Date();
  const graceHours = 24;
  const cutoff = new Date(now.getTime() - graceHours * 60 * 60 * 1000);

  const filter = {
    status: 'scheduled',
    scheduledAt: { $lt: cutoff },
  };

  const update = {
    $set: {
      status: 'cancelled',
      statusReason: 'auto_cancelled_due_to_staleness',
    },
  };

  const result = await Session.updateMany(filter, update);

  if (result.modifiedCount > 0) {
    logger.info(
      {
        modified: result.modifiedCount,
      },
      'Auto-cancelled stale sessions'
    );
  }
}