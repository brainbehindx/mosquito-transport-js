import { ServerReachableListener, StoreReadyListener } from "./listeners";
import { CACHE_STORAGE_PATH } from "./values";
import { CacheStore, Scoped } from "./variables";
import { serializeE2E } from "./peripherals";
import { DatastoreParser } from "../products/database/bson";
import { deserialize } from "entity-serializer";
import { breakDbMap, purgeRedundantRecords } from "./purger";
import { getCoreDB, resolveIDBRequest } from "./fs_manager";
import { Buffer } from "buffer";
import { basicClone } from "./basic_clone";

const CacheKeys = Object.keys(CacheStore);

const prefillDatastore = (obj, caller) => {
    obj = basicClone(obj);
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

const prefillFetcher = (store, encode) => {
    store = basicClone(store);
    Object.values(store).forEach(accessIdObj => {
        Object.values(accessIdObj).forEach(value => {
            value.data.buffer = encode ?
                Buffer.from(value.data.buffer).toString('base64')
                : Buffer.from(value.data.buffer, 'base64');
        });
    });
    return store;
}

export const updateCacheStore = async (node) => {
    try { window } catch (_) { return; }
    node = node && node.filter((v, i, a) => a.indexOf(v) === i);

    const { io, promoteCache, isMemory } = Scoped.ReleaseCacheData;

    const {
        AuthStore,
        EmulatedAuth,
        PendingAuthPurge,
        DatabaseStore,
        PendingWrites,
        FetchedStore,
        ...restStore
    } = CacheStore;

    const minimizePendingWrite = () => {
        const obj = basicClone(PendingWrites);
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
                PendingWrites: minimizePendingWrite(),
                FetchedStore: prefillFetcher(FetchedStore, true)
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
    const tobePurged = [];

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
            if (data.FetchedStore)
                data.FetchedStore = prefillFetcher(data.FetchedStore, false);
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
        await purgeRedundantRecords(data, builder, purgeNodes => {
            tobePurged.push(...purgeNodes);
        });
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
    StoreReadyListener.dispatchPersist('_', 'ready');
    setTimeout(() => {
        if (tobePurged.length) updateCacheStore(tobePurged);
    }, 0);
};

export const getPrefferTime = () => Date.now() + (Scoped.serverTimeOffset || 0);

export const awaitStore = () => new Promise(resolve => {
    if (Scoped.IsStoreReady) {
        resolve();
        return;
    }
    const l = StoreReadyListener.listenToPersist('_', t => {
        if (t === 'ready') {
            resolve();
            l();
        }
    });
});

export const awaitReachableServer = (projectUrl) => new Promise(resolve => {
    if (Scoped.IS_CONNECTED[projectUrl]) {
        resolve();
        return;
    }
    const l = ServerReachableListener.listenToPersist(projectUrl, t => {
        if (t) {
            resolve();
            l();
        }
    });
});

export const getReachableServer = (projectUrl) => new Promise(resolve => {
    if (typeof Scoped.IS_CONNECTED[projectUrl] === 'boolean') {
        resolve(Scoped.IS_CONNECTED[projectUrl]);
        return;
    }
    const l = ServerReachableListener.listenToPersist(projectUrl, t => {
        if (typeof t === 'boolean') {
            resolve(t);
            l();
        }
    });
});

export const buildFetchInterface = async ({ body, authToken, method, uglify, serverE2E_PublicKey, extraHeaders }) => {
    if (!uglify) body = JSON.stringify({ ...body });
    const [plate, keyPair] = uglify ? await serializeE2E(body, authToken, serverE2E_PublicKey) : [undefined, []];

    return [{
        body: uglify ? plate : body,
        headers: {
            ...extraHeaders,
            'Content-type': uglify ? 'request/buffer' : 'application/json',
            ...(authToken && !uglify) ? { 'mtoken': authToken } : {}
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