import pino from 'pino'
import config from '../config/env.js'

const logger = pino({
    level: config.env === 'production' ? 'info' : 'debug',
    transport: 
    config.env === 'development' ?{
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid, hostname'
        }
    } : undefined
})

export default logger