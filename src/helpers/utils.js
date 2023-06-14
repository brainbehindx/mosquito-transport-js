import { ServerReachableListener } from "./listeners";
import { CACHE_STORAGE_PATH } from "./values";
import { CacheStore, Scoped } from "./variables";

export const updateCacheStore = () => {
    clearTimeout(Scoped.cacheStorageReducer);
    Scoped.cacheStorageReducer = setTimeout(() => {
        localStorage.setItem(CACHE_STORAGE_PATH, JSON.stringify({
            DatabaseStore: CacheStore.DatabaseStore,
            DatabaseRecords: CacheStore.DatabaseRecords,
            AuthStore: CacheStore.AuthStore,
            PendingWrites: CacheStore.PendingWrites
        }))
    }, 500);
}

export const releaseCacheStore = () => {
    const j = JSON.parse(localStorage.getItem(CACHE_STORAGE_PATH) || '{}');

    console.log('mosquitoCache: ', JSON.stringify(j));
    Object.keys(j).forEach(e => {
        CacheStore[e] = j[e];
    });
    Object.entries(CacheStore.AuthStore).forEach(([key, value]) => {
        Scoped.AuthJWTToken[key] = value?.token;
    });
    // TODO: commit pending write
}

export const awaitReachableServer = (projectUrl) => new Promise(resolve => {
    if (Scoped.IS_CONNECTED[projectUrl]) {
        resolve();
        return;
    }
    const l = ServerReachableListener.startKeyListener(projectUrl, t => {
        if (t) {
            resolve();
            l();
        }
    }, true);
});

export const buildFetchInterface = (body, accessKey, authToken, method) => ({
    body: JSON.stringify({ ...body }),
    headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${btoa(accessKey)}`,
        ...(authToken ? { 'Mosquitodb-Token': authToken } : {})
    },
    method: method || 'POST'
});

export const simplifyError = (error, message) => ({
    simpleError: { error, message }
});