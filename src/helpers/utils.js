import { ServerReachableListener, StoreReadyListener } from "./listeners";
import { CACHE_STORAGE_PATH } from "./values";
import { CacheStore, Scoped } from "./variables";
import { serializeE2E } from "./peripherals";
import { deserializeBSON, serializeToBase64 } from "../products/database/bson";
import { trySendPendingWrite } from "../products/database";
import { deserialize } from "entity-serializer";
import { purgeRedundantRecords } from "./purger";

export const updateCacheStore = (timer = 300, node) => {
    try { window } catch (_) { return; }

    const { io, promoteCache } = Scoped.ReleaseCacheData;

    const doUpdate = async () => {
        const {
            AuthStore,
            EmulatedAuth,
            PendingAuthPurge,
            DatabaseStore,
            PendingWrites,
            ...restStore
        } = CacheStore;

        const txt = JSON.stringify({
            AuthStore,
            EmulatedAuth,
            PendingAuthPurge,
            ...promoteCache ? {
                DatabaseStore: serializeToBase64(DatabaseStore),
                PendingWrites: serializeToBase64(PendingWrites)
            } : {},
            ...promoteCache ? restStore : {}
        });

        if (io) {
            io.output(txt, node);
        } else window.localStorage.setItem(CACHE_STORAGE_PATH, txt);
    };

    clearTimeout(Scoped.cacheStorageReducer);
    if (timer) {
        Scoped.cacheStorageReducer = setTimeout(doUpdate, timer);
    } else doUpdate();
};

export const releaseCacheStore = async (builder) => {
    try { window } catch (_) { return; }
    const { io } = builder;

    let data = {};

    try {
        if (io) {
            data = await io.input();
        } else data = window.localStorage.getItem(CACHE_STORAGE_PATH);
        data = JSON.parse(data || '{}');
        await purgeRedundantRecords(data, builder);
    } catch (error) {
        console.error('releaseCacheStore err:', error);
    }

    Object.entries(data).forEach(([k, v]) => {
        if (['DatabaseStore', 'PendingWrites'].includes(k)) {
            CacheStore[k] = deserializeBSON(v);
        } else CacheStore[k] = v;
    });
    Object.entries(CacheStore.AuthStore).forEach(([key, value]) => {
        Scoped.AuthJWTToken[key] = value?.token;
    });
    Object.keys(CacheStore.PendingWrites).forEach(projectUrl => {
        if (Scoped.IS_CONNECTED[projectUrl])
            trySendPendingWrite(projectUrl);
    });
    Scoped.IsStoreReady = true;
    StoreReadyListener.dispatch('_', 'ready');
};

export const getPrefferTime = () => Date.now() + (Scoped.serverTimeOffset || 0);

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

export const buildFetchInterface = async ({ body, authToken, method, uglify, serverE2E_PublicKey, extraHeaders }) => {
    if (!uglify) body = JSON.stringify({ ...body });
    const [plate, keyPair] = uglify ? await serializeE2E(body, authToken, serverE2E_PublicKey) : [undefined, []];

    return [{
        body: uglify ? plate : body,
        // cache: 'no-cache',
        headers: {
            ...extraHeaders,
            'Content-type': uglify ? 'request/buffer' : 'application/json',
            ...(authToken && !uglify) ? { 'Mosquito-Token': authToken } : {}
        },
        method: method || 'POST'
    }, keyPair];
};

export const buildFetchResult = async (fetchRef, ugly) => {
    if (ugly) {
        const [data, simpleError] = deserialize(await fetchRef.arrayBuffer());
        if (simpleError) throw simpleError;
        return data;
    }
    const json = await fetchRef.json();
    if (json.simpleError) throw json;
    return json;
};