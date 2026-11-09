import axios from 'axios'
import logger from '../utils/logger.js'

export function createHttpClient({ baseURL, timeout = 5000, headers = {} } = {}) {
    const instance = axios.create({
        baseURL,
        timeout,
        headers: {
            Accept: 'application/json',
            ...headers
        }
    })

    // Request Logging
    instance.interceptors.request.use((cfg) => {
        logger.debug(
            { method: cfg.method, url: cfg.url, baseURL: cfg.baseURL },
            'HTTP request'
        )
        return cfg
    })

    // Response logging + unified error shape
    instance.interceptors.response.use(
        (res) => {
            logger.debug(
                { status: res.status, url: res.config.url },
                'HTTP response'
            );
            return res;
        },
        (err) => {
            logger.warn(
                {
                    url: err.config?.url,
                    method: err.config?.method,
                    status: err.response?.status,
                    message: err.message,
                },
                'HTTP error'
            );
            return Promise.reject(err);
        }
    );

    return instance;
}
