import { deserialize, serialize } from "entity-serializer";
import { Scoped } from "./variables";
import { CACHE_STORAGE_PATH } from "./values";

const PRIMARY_KEY = 'primary_key';
const SUB_TABLE = {
    METADATA: p => `${p}:META`,
    DATA: p => `${p}:DATA`
};

/**
 * this method linearize read/write for individual access_id on the file system ensuring consistency across concurrent operations
 * 
 * @param {any} builder 
 * @param {string} access_id 
 * @returns {(task: (system: { set: (table: string, primary_key: string, value: {}) => Promise<void>, delete: (table: string, primary_key: string) => Promise<void>, find: (table: string, primary_key: string, extractions: string[]) => Promise<{}>, list: (table: string, extractions: string[]) => Promise<[string, {}][]> }) => any) => Promise<any>}
 */
export const useFS = (builder, access_id) => async (task) => {
    const { projectUrl, dbUrl, dbName } = builder;
    const nodeId = typeof builder === 'string' ? `${builder}_${access_id}` : `${projectUrl}_${dbUrl}_${dbName}_${access_id}`;

    const thatProcess = Scoped.linearDbOpenProcess[nodeId];

    const thisPromise = new Promise(async (resolve, reject) => {
        try {
            if (thatProcess !== undefined) await thatProcess;
        } catch (_) { }
        try {
            resolve(await task(getSystem(builder)));
        } catch (error) {
            console.error('useFS err:', error, ' builder:', builder);
            reject(error);
        } finally {
            if (Scoped.linearDbOpenProcess[nodeId] === thisPromise)
                delete Scoped.linearDbOpenProcess[nodeId];
        }
    });

    Scoped.linearDbOpenProcess[nodeId] = thisPromise;
    return (await thisPromise);
};

export const getSystem = (builder) => {
    const { projectUrl } = builder;
    const DB_NAME = `${CACHE_STORAGE_PATH}::${purifyFilepath(typeof builder === 'string' ? builder : projectUrl)}`;

    /**
     * @param {string} table 
     * @param {undefined | boolean} upgradable 
     * @returns {Promise<{ db: IDBDatabase, end: () => void }>}
     */
    const prepareDb = async (table, upgradable) => {
        const linear_id = `${DB_NAME}_${table}`;
        if (!Scoped.chainedDbOperator[linear_id])
            Scoped.chainedDbOperator[linear_id] = { ite: 0 };
        ++Scoped.chainedDbOperator[linear_id].ite;

        const { promise: prevDb, endPromise } = Scoped.chainedDbOperator[linear_id];

        const thisPromise = (async () => {
            const onupgraded = upgradable && (s => {
                s.createObjectStore(SUB_TABLE.METADATA(table), { keyPath: PRIMARY_KEY });
                s.createObjectStore(SUB_TABLE.DATA(table), { keyPath: PRIMARY_KEY });
            });
            let thisDb = prevDb && await prevDb.catch(() => null);

            if (!thisDb) {
                thisDb = await getCoreDB(DB_NAME, undefined, s => {
                    onupgraded?.(s.target.result);
                }).then(r => r.db);
            }

            if (!thisDb.objectStoreNames.contains(SUB_TABLE.METADATA(table))) {
                if (endPromise) await endPromise.catch(() => null);
                thisDb.close();
                if (!onupgraded) throw 'operation failure caused by inability to upgrade database store';
                thisDb = await getCoreDB(DB_NAME, thisDb.version + 1, s => {
                    onupgraded?.(s.target.result);
                }).then(r => r.db);
            }
            return thisDb;
        })();
        // linearize db upgrade
        let endPromiseCallback;
        Scoped.chainedDbOperator[linear_id].promise = thisPromise;
        Scoped.chainedDbOperator[linear_id].endPromise = new Promise(resolve => {
            endPromiseCallback = resolve;
        });

        const cleanup = async () => {
            const thatProcess = Scoped.chainedDbOperator[linear_id];

            if (--thatProcess.ite) return;
            delete Scoped.chainedDbOperator[linear_id];
            (await thatProcess.promise).close();
        };

        try {
            const db = await thisPromise;
            return {
                db,
                end: () => {
                    endPromiseCallback();
                    setTimeout(cleanup, 900)
                }
            };
        } catch (_) {
            endPromiseCallback();
            cleanup();
        }
    }

    return {
        set: async (table, primary_key, value) => {
            const { db, end } = await prepareDb(table, true);
            try {
                const isFull = 'value' in value;
                const tx = db.transaction([SUB_TABLE.METADATA(table), SUB_TABLE.DATA(table)].slice(0, isFull ? undefined : 1), 'readwrite');
                const meta_store = tx.objectStore(SUB_TABLE.METADATA(table));

                if (isFull) {
                    const value_store = tx.objectStore(SUB_TABLE.DATA(table));
                    const { value: main_value, ...meta } = value;
                    await Promise.all([
                        meta_store.put({ ...meta, [PRIMARY_KEY]: primary_key }),
                        value_store.put({ value: serialize(main_value), [PRIMARY_KEY]: primary_key })
                    ].map(resolveIDBRequest));
                } else {
                    const newMeta = {
                        ...await resolveIDBRequest(meta_store.get(primary_key)),
                        ...value,
                        [PRIMARY_KEY]: primary_key
                    };
                    await resolveIDBRequest(meta_store.put(newMeta));
                }
                try { tx.commit(); } catch (_) { }
            } catch (error) {
                throw error;
            } finally {
                end();
            }
        },
        delete: async (table, primary_key) => {
            const { db, end } = await prepareDb(table);
            try {
                const tx = db.transaction([SUB_TABLE.METADATA(table), SUB_TABLE.DATA(table)], 'readwrite');
                const meta_store = tx.objectStore(SUB_TABLE.METADATA(table));
                const value_store = tx.objectStore(SUB_TABLE.DATA(table));

                await Promise.all([
                    meta_store.delete(primary_key),
                    value_store.delete(primary_key)
                ].map(resolveIDBRequest));
                try { tx.commit(); } catch (_) { }
                return true;
            } catch (error) {
                throw error;
            } finally {
                end();
            }
        },
        find: async (table, primary_key, extractions) => {
            const { db, end } = await prepareDb(table, true);
            const doExtraction = (s) =>
                Object.fromEntries(
                    extractions.filter(v => s.hasOwnProperty(v))
                        .map(v => [v, s[v]])
                );

            try {
                const isFull = extractions.includes('value');
                const onlyValue = isFull && extractions.length === 1;
                const tx = db.transaction(
                    [
                        onlyValue ? undefined : SUB_TABLE.METADATA(table),
                        isFull ? SUB_TABLE.DATA(table) : undefined
                    ].filter(v => v),
                    'readonly'
                );
                const meta_store = !onlyValue && tx.objectStore(SUB_TABLE.METADATA(table));

                if (isFull) {
                    const value_store = tx.objectStore(SUB_TABLE.DATA(table));
                    const [m, v] = await Promise.all([
                        onlyValue ? Promise.resolve() : resolveIDBRequest(meta_store.get(primary_key)),
                        resolveIDBRequest(value_store.get(primary_key))
                    ]);
                    if ((m || onlyValue) && v) return doExtraction({ ...m, value: deserialize(v.value) });
                } else {
                    const m = await resolveIDBRequest(meta_store.get(primary_key));
                    if (m) return doExtraction({ ...m });
                }
                throw `record matching key:${primary_key} not found`;
            } catch (error) {
                throw error;
            } finally {
                end();
            }
        },
        list: async (table, extractions) => {
            const { db, end } = await prepareDb(table);
            try {
                const tx = db.transaction([SUB_TABLE.METADATA(table)], 'readonly');
                const meta_store = tx.objectStore(SUB_TABLE.METADATA(table));

                const names = await resolveIDBRequest(meta_store.getAllKeys());
                const list_data = await Promise.all(names.map(async primary_key => {
                    if (!extractions.length) return [primary_key, {}];
                    const obj = await getSystem(builder)
                        .find(table, primary_key, extractions)
                        .catch(() => null);
                    if (!obj) return;
                    return [primary_key, obj];
                }));

                return list_data.filter(v => v);
            } catch (error) {
                throw error;
            } finally {
                end();
            }
        }
    };
};

export function purifyFilepath(filename) {
    if (!filename || typeof filename !== 'string')
        throw `invalid filename:${filename}`;
    return filename;
}

export const FS_PATH = {
    LIMITER_RESULT: (path, dbUrl, dbName) => `${dbUrl}_${dbName}_${purifyFilepath(path)}_LR`,
    LIMITER_DATA: (path, dbUrl, dbName) => `${dbUrl}_${dbName}_${purifyFilepath(path)}_LD`,
    DB_COUNT_QUERY: (path, dbUrl, dbName) => `${dbUrl}_${dbName}_${purifyFilepath(path)}_QC`,
    FETCHERS: 'FETCHERS'
};

/**
 * @param {string} db_name 
 * @param {number} version 
 * @param {IDBOpenDBRequest['onupgradeneeded']} onupgradeneeded 
 * @returns {Promise<{db: IDBDatabase, event: Event}>}
 */
export const getCoreDB = (db_name, version, onupgradeneeded) =>
    new Promise((resolve, reject) => {
        try {
            const result = indexedDB.open(db_name, version);

            result.onupgradeneeded = onupgradeneeded;
            result.onsuccess = (e) => resolve({
                db: e.target.result,
                event: e
            });
            result.onerror = reject;
        } catch (error) {
            reject(error);
        }
    });

/**
 * @param {IDBRequest} instance 
 * @returns {Promise<any>}
 */
export const resolveIDBRequest = (instance) =>
    new Promise((resolve, reject) => {
        instance.onsuccess = (s) => {
            resolve(s.result);
        };
        instance.onerror = e => {
            reject(instance.error);
        }
    });