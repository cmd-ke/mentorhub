import session from 'express-session';
import MongoStore from 'connect-mongo';
import config from './env.js';

export function createSessionMiddleware(){

    const isProduction = config.env === 'production'

    const store = MongoStore.create({
        mongoUrl: config.mongo_URI,
        collectionName: 'sessions',
        ttl: Math.floor(config.session.lifetimeMs/1000)
    })


    return session({
        name: config.session.name,
        secret: config.session.secret,
        store,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: isProduction,

            sameSite: isProduction ? 'none' : 'lax',
            maxAge: config.session.lifetimeMs

        }

    })
}