import http from 'http'
import config from './config/env.js' // 1. Move environment configuration to the very top!
import app from './app.js'
import { connectDB } from './config/db.js'
import logger from './utils/logger.js'
import { initScheduledJobs } from './jobs/scheduler.js'

async function startServer(){
    // 2. Pass config.mongodbUri explicitly or let db.js read process.env safely
    await connectDB()

    initScheduledJobs()

    const server = http.createServer(app)

    server.listen(config.port, ()=> {
        logger.info({
          port: config.port, env: config.env
        },'Server is running'
    );
    })

  // Handle unexpected errors gracefully
  process.on('unhandledRejection', (err) => {
    logger.error({err}, 'UNHANDLED REJECTION')
    // Safe check if server variable exists during a failure bootstrap 
    if (server) server.close(() => process.exit(1));
    else process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'UNCAUGHT EXCEPTION');
    if (server) server.close(() => process.exit(1));
    else process.exit(1);
  });
}

startServer()
