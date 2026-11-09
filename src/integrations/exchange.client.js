import { createHttpClient } from './http.client.js'
import config from '../config/env.js'


const client = createHttpClient({
    baseURL: config.integrations.exchange.baseUrl,
    timeout: config.integrations.exchange.timeoutMs
})


/**
 * Convert an amount from one currency to another.
 * API: GET /convert?from=USD&to=EUR&amount=100
 */
export async function convertCurrency ({from, to , amount}){
    const {data} = await client.get('/convert', {
        params: {from, to, amount},
    });

     if (!data || typeof data.result !== 'number') {
    const err = new Error('Invalid response from exchange API');
    err.code = 'EXCHANGE_INVALID_RESPONSE';
    throw err;
  }

  return {
    from,
    to,
    amount,
    rate: data.info?.rate ?? null,
    result: data.result,
    date: data.date,
  };


}