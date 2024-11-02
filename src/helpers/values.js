import { encodeBinary } from './peripherals';

export const CACHE_STORAGE_PATH = encodeBinary('MOSQUITO_TRANSPORT_FREEZER'),
    DEFAULT_CACHE_PASSWORD = encodeBinary('MOSQUITO_TRANSPORT_CACHE_PASSWORD');

export const CACHE_PROTOCOL = {
    LOCAL_STORAGE: 'local-storage'
};

export const RETRIEVAL = {
    STICKY: 'sticky',
    STICKY_NO_AWAIT: 'sticky-no-await',
    STICKY_RELOAD: 'sticky-reload',
    DEFAULT: 'default',
    CACHE_NO_AWAIT: 'cache-no-await',
    NO_CACHE_NO_AWAIT: 'no-cache-no-await',
    NO_CACHE_AWAIT: 'no-cache-await'
};

export const DELIVERY = {
    DEFAULT: 'default',
    NO_CACHE: 'no-cache',
    NO_AWAIT: 'no-await',
    NO_AWAIT_NO_CACHE: 'no-await-no-cache',
    AWAIT_NO_CACHE: 'await-no-cache',
    CACHE_NO_AWAIT: 'cache-no-await'
};

export const AUTH_PROVIDER_ID = {
    GOOGLE: 'google.com',
    FACEBOOK: 'facebook.com',
    PASSWORD: 'password',
    TWITTER: 'x.com',
    GITHUB: 'github.com',
    APPLE: 'apple.com'
};