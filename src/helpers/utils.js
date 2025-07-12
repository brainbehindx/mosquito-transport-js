import { ServerReachableListener, StoreReadyListener } from "./listeners";
import { CACHE_STORAGE_PATH } from "./values";
import { CacheStore, Scoped } from "./variables";
import { serializeE2E } from "./peripherals";
import { DatastoreParser } from "../products/database/bson";
import { deserialize } from "entity-serializer";
import { breakDbMap, purgeRedundantRecords } from "./purger";
import { getCoreDB, resolveIDBRequest } from "./fs_manager";
import cloneDeep from "lodash/cloneDeep";

const CacheKeys = Object.keys(CacheStore);

const prefillDatastore = (obj, caller) => {
    obj = cloneDeep(obj);
    breakDbMap(obj, (_projectUrl, _dbUrl, _dbName, _path, value) => {
        Object.entries(value.instance).forEach(([access_id, obj]) => {
            value.instance[access_id] = caller(obj);
        });
        Object.entries(value.episode).forEach(([_access_id, limitObj]) => {
            Object.entries(limitObj).forEach(([limit, obj]) => {
                limitObj[limit] = caller(obj);
            });
        });
    });
    return obj;
};

const getBaseDb = () =>
    getCoreDB(`${CACHE_STORAGE_PATH}::center`, 1, r => {
        r.target.result.createObjectStore('main', { keyPath: 'id' });
    });

export const updateCacheStore = async (node) => {
    try { window } catch (_) { return; }

    const { io, promoteCache, isMemory } = Scoped.ReleaseCacheData;

    const {
        AuthStore,
        EmulatedAuth,
        PendingAuthPurge,
        DatabaseStore,
        PendingWrites,
        ...restStore
    } = CacheStore;

    const minimizePendingWrite = () => {
        const obj = cloneDeep(PendingWrites);
        Object.values(obj).forEach(e => {
            Object.values(e).forEach(b => {
                if ('editions' in b) delete b.editions;
            });
        });
        return obj;
    }

    if (isMemory) {
        const txt = JSON.stringify({
            AuthStore,
            EmulatedAuth,
            PendingAuthPurge,
            ...promoteCache ? {
                DatabaseStore: prefillDatastore(DatabaseStore, DatastoreParser.encode),
                PendingWrites: minimizePendingWrite()
            } : {},
            ...promoteCache ? restStore : {}
        });

        if (io) {
            io.output(txt, node);
        } else window.localStorage.setItem(CACHE_STORAGE_PATH, txt);
        return;
    } else {
        // use indexed-db
        const exclusion = ['DatabaseStore', 'DatabaseCountResult', 'FetchedStore'];
        const updationKey = (node ? Array.isArray(node) ? node : [node] : CacheKeys).filter(v => !exclusion.includes(v));

        if (!updationKey.length) return;
        const { db } = await getBaseDb();
        const tx = db.transaction('main');
        const stores = tx.objectStore('main');

        await Promise.all(
            updationKey
                .map(v => [v, v === 'PendingWrites' ? minimizePendingWrite() : CacheStore[v]])
                .map(([ref, value]) =>
                    resolveIDBRequest(stores.put({ id: ref, value }))
                )
        ).catch(err => {
            console.error('updateCacheStore err:', err);
        });
        try { tx.commit(); } catch (_) { }
        db.close();
    }
};

export const releaseCacheStore = async (builder) => {
    try { window } catch (_) { return; }
    const { io, isMemory } = builder;

    let data = {};

    try {
        if (isMemory) {
            if (io) {
                data = await io.input();
            } else data = window.localStorage.getItem(CACHE_STORAGE_PATH);
            data = JSON.parse(data || '{}');
            if (data.DatabaseStore)
                data.DatabaseStore = prefillDatastore(
                    data.DatabaseStore,
                    r => DatastoreParser.decode(r, false)
                );
        } else {
            const { db } = await getBaseDb();
            const tx = db.transaction('main', 'readonly');
            const stores = tx.objectStore('main');

            const query = await resolveIDBRequest(stores.getAll());
            data = Object.fromEntries(
                query.map(({ id, value }) =>
                    [id, value]
                )
            );
            db.close();
        }
        await purgeRedundantRecords(data, builder);
    } catch (e) {
        console.error('releaseCacheStore data err:', e);
    }

    Object.entries(data).forEach(([k, v]) => {
        CacheStore[k] = v;
    });
    Object.entries(CacheStore.AuthStore).forEach(([key, value]) => {
        Scoped.AuthJWTToken[key] = value?.token;
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
        method: method || 'POST',
        credentials: 'omit'
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