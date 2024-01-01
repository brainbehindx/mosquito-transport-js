import { ServerReachableListener, StoreReadyListener } from "./listeners";
import { CACHE_PROTOCOL, CACHE_STORAGE_PATH, DEFAULT_CACHE_PASSWORD } from "./values";
import { CacheStore, Scoped } from "./variables";
import { decryptString, encryptString, niceTry, serializeE2E } from "./peripherals";

export const updateCacheStore = () => {
    try { window } catch (_) { return; }
    const {
        cachePassword = DEFAULT_CACHE_PASSWORD,
        cacheProtocol = CACHE_PROTOCOL.LOCAL_STORAGE
    } = Scoped.ReleaseCacheData;

    clearTimeout(Scoped.cacheStorageReducer);
    Scoped.cacheStorageReducer = setTimeout(() => {
        const txt = encryptString(
            JSON.stringify({ ...CacheStore }),
            cachePassword,
            cachePassword
        );

        if (cacheProtocol === CACHE_PROTOCOL.LOCAL_STORAGE) {
            window.localStorage.setItem(CACHE_STORAGE_PATH, txt);
        }
    }, 500);
}

export const releaseCacheStore = async (builder) => {
    try { window } catch (_) { return; }
    const {
        cachePassword = DEFAULT_CACHE_PASSWORD,
        cacheProtocol = CACHE_PROTOCOL.LOCAL_STORAGE
    } = builder;

    let txt;

    if (cacheProtocol === CACHE_PROTOCOL.LOCAL_STORAGE) {
        txt = window.localStorage.getItem(CACHE_STORAGE_PATH);
    }

    const j = JSON.parse(decryptString(txt || '', cachePassword, cachePassword) || '{}');
    
    Object.entries(j).forEach(([k, v]) => {
        CacheStore[k] = v;
    });
    Object.entries(CacheStore.AuthStore).forEach(([key, value]) => {
        Scoped.AuthJWTToken[key] = value?.token;
    });
    Scoped.IsStoreReady = true;
    StoreReadyListener.dispatch('_', 'ready');
    // TODO: commit pending write
}

export const awaitStore = () => new Promise(resolve => {
    if (Scoped.IsStoreReady) {
        resolve();
        return;
    }
    const l = StoreReadyListener.listenTo('_', t => {
        if (t === 'ready') {
            resolve();
            l();
        }
    }, true);
});

export const awaitReachableServer = (projectUrl) => new Promise(resolve => {
    if (Scoped.IS_CONNECTED[projectUrl]) {
        resolve();
        return;
    }
    const l = ServerReachableListener.listenTo(projectUrl, t => {
        if (t) {
            resolve();
            l();
        }
    }, true);
});

export const getReachableServer = (projectUrl) => new Promise(resolve => {
    if (typeof Scoped.IS_CONNECTED[projectUrl] === 'boolean') {
        resolve(Scoped.IS_CONNECTED[projectUrl]);
        return;
    }
    const l = ServerReachableListener.listenTo(projectUrl, t => {
        if (typeof t === 'boolean') {
            resolve(t);
            l();
        }
    }, true);
});

export const buildFetchInterface = ({ body, accessKey, authToken, method, uglify, serverE2E_PublicKey }) => {
    if (!uglify) body = JSON.stringify({ ...body });
    const [plate, keyPair] = uglify ? serializeE2E(body, authToken, serverE2E_PublicKey) : [undefined, []];

    return [{
        body: uglify ? plate : body,
        cache: 'no-cache',
        headers: {
            'Content-type': uglify ? 'text/plain' : 'application/json',
            'Authorization': accessKey,
            ...((authToken && !uglify) ? { 'Mosquito-Token': authToken } : {})
        },
        method: method || 'POST'
    }, keyPair];
};

export const simplifyError = (error, message) => ({
    simpleError: { error, message }
});

export const validateRequestMethod = (method) => {
    // TODO:
}