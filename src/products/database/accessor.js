import { niceHash, shuffleArray, sortArrayByObjectKey } from "../../helpers/peripherals";
import { awaitStore, updateCacheStore } from "../../helpers/utils";
import { CacheStore, Scoped } from "../../helpers/variables";
import { assignExtractionFind, CompareBson, confirmFilterDoc, defaultBSON, downcastBSON, validateCollectionName, validateFilter } from "./validator";
import { DatabaseRecordsListener } from "../../helpers/listeners";
import { BSONRegExp, ObjectId, Timestamp } from "bson";
import { niceGuard, Validator } from "guard-object";
import { TIMESTAMP } from "./types";
import { docSize, incrementDatabaseSize } from "./counter";
import sendMessage from "../../helpers/broadcaster";
import { DatastoreParser, serializeToBase64 } from "./bson";
import { FS_PATH, getSystem, useFS } from "../../helpers/fs_manager";
import { grab, poke, unpoke } from "poke-object";
import { basicClone } from "../../helpers/basic_clone";

const { LIMITER_DATA, LIMITER_RESULT, DB_COUNT_QUERY } = FS_PATH;

export const listenQueryEntry = (callback, { accessId, builder, config, processId }) => {
    const { projectUrl, dbName, dbUrl, path } = builder;
    const { episode = 0 } = config || {};

    const nodeID = `${projectUrl}_${dbName}_${dbUrl}_${path}`;

    if (!Scoped.ActiveDatabaseListeners[nodeID])
        Scoped.ActiveDatabaseListeners[nodeID] = {};
    Scoped.ActiveDatabaseListeners[nodeID][processId] = Date.now();

    const listener = DatabaseRecordsListener.listenTo('d', async (dispatchId) => {
        if (dispatchId !== processId) return;
        const cache = await getRecord(builder, accessId, episode);
        if (cache) callback(cache[0]);
    });

    return () => {
        listener();
        if (Scoped.ActiveDatabaseListeners[nodeID]?.[processId]) {
            delete Scoped.ActiveDatabaseListeners[nodeID][processId];

            if (!Object.keys(Scoped.ActiveDatabaseListeners[nodeID]).length)
                delete Scoped.ActiveDatabaseListeners[nodeID];
        }
    };
};

export const insertCountQuery = async (builder, access_id, value) => {
    const { projectUrl, dbUrl, dbName, path } = builder;

    const { isMemory } = Scoped.ReleaseCacheData;
    if (isMemory) {
        poke(CacheStore.DatabaseCountResult, [projectUrl, dbUrl, dbName, path, access_id], { value, touched: Date.now() });
        updateCacheStore(['DatabaseCountResult']);
    } else {
        await useFS(builder, access_id)(async fs => {
            await fs.set(DB_COUNT_QUERY(path, dbUrl, dbName), access_id, { value, touched: Date.now() });
            poke(CacheStore.DatabaseStats.counters, [projectUrl, dbUrl, dbName, path], true);
        });
        updateCacheStore(['DatabaseStats']);
    }
}

export const getCountQuery = async (builder, access_id) => {
    const { projectUrl, dbUrl, dbName, path } = builder;
    const { isMemory } = Scoped.ReleaseCacheData;

    if (isMemory) {
        const data = grab(CacheStore.DatabaseCountResult, [projectUrl, dbUrl, dbName, path, access_id]);
        if (data) data.touched = Date.now();
        return data && data.value;
    } else {
        return useFS(builder, access_id)(async fs => {
            const data = await fs.find(DB_COUNT_QUERY(path, dbUrl, dbName), access_id, ['value']).catch(() => null);
            if (data) {
                await fs.set(DB_COUNT_QUERY(path, dbUrl, dbName), access_id, { touched: Date.now() });
                return data.value;
            }
        });
    }
}

export const insertRecord = async (builder, config, accessIdWithoutLimit, value, episode = 0) => {
    builder = builder && basicClone(builder);
    config = config && basicClone(config);
    value = value && basicClone(value);

    await awaitStore();
    const { isMemory } = Scoped.ReleaseCacheData;
    const { projectUrl, dbUrl, dbName, path, command } = builder;
    const { limit } = command;
    const thisSize = docSize(value);

    if (!isMemory) {
        await useFS(builder, accessIdWithoutLimit)(async fs => {
            const resultAccessId = `${accessIdWithoutLimit}-${limit}`;

            const [instanceData, resultData] = await Promise.all([
                fs.find(LIMITER_DATA(path, dbUrl, dbName), accessIdWithoutLimit, ['size']).catch(() => undefined),
                fs.find(LIMITER_RESULT(path, dbUrl, dbName), resultAccessId, ['size']).catch(() => undefined)
            ]);
            const isEpisode = episode === 1 || !!resultData;

            const editionSizeOffset = thisSize - (instanceData?.size || 0);
            const resultSizeOffset = isEpisode ? thisSize - (resultData?.size || 0) : 0;

            const newData = DatastoreParser.encode({
                command,
                config,
                latest_limiter: limit,
                data: value ? Array.isArray(value) ? value : [value] : []
            });
            const newResultData = isEpisode && DatastoreParser.encode({
                data: value,
                size: thisSize
            });

            await Promise.all([
                fs.set(LIMITER_DATA(path, dbUrl, dbName), accessIdWithoutLimit, {
                    value: newData,
                    touched: Date.now(),
                    size: thisSize
                }),
                isEpisode ?
                    fs.set(LIMITER_RESULT(path, dbUrl, dbName), resultAccessId, {
                        access_id: accessIdWithoutLimit,
                        value: newResultData,
                        touched: Date.now(),
                        size: thisSize
                    }) : Promise.resolve()
            ]);
            incrementDatabaseSize(builder, path, editionSizeOffset + resultSizeOffset);
        });
        updateCacheStore(['DatabaseStats']);
        return;
    }

    const instanceData = grab(CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'instance', accessIdWithoutLimit]);
    const resultData = grab(CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'episode', accessIdWithoutLimit, `${limit}`]);
    const isEpisode = episode === 1 || !!resultData;

    const editionSizeOffset = thisSize - (instanceData?.size || 0);
    const resultSizeOffset = isEpisode ? thisSize - (resultData?.size || 0) : 0;

    const newData = {
        command,
        config,
        latest_limiter: limit,
        size: thisSize,
        data: value ? Array.isArray(value) ? value : [value] : [],
        touched: Date.now()
    };
    const newResultData = isEpisode && {
        data: value,
        size: thisSize,
        touched: Date.now()
    };

    incrementDatabaseSize(builder, path, editionSizeOffset + resultSizeOffset);

    poke(CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'instance', accessIdWithoutLimit], newData);
    if (isEpisode) poke(CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'episode', accessIdWithoutLimit, `${limit}`], basicClone(newResultData));
    updateCacheStore(['DatabaseStore', 'DatabaseStats']);
};

export const getRecord = async (builder, accessIdWithoutLimit, episode = 0) => {
    await awaitStore();
    const { isMemory } = Scoped.ReleaseCacheData;
    const { projectUrl, dbUrl, dbName, path, command } = builder;
    const { limit, sort, direction, random, findOne } = command;
    const isEpisode = episode === 1;

    const transformData = (data) => {
        data = basicClone(data);
        if (random) {
            data = shuffleArray(data);
        } else if (sort) {
            data = sortArrayByObjectKey(data.slice(0), sort);
            if (
                direction === -1 ||
                direction === 'desc' ||
                direction === 'descending'
            ) data = data.slice(0).reverse();
        }

        if (findOne) {
            data = data[0];
        } else if (limit) data = data.slice(0, limit);

        return data;
    }

    if (!isMemory) {
        const record = await useFS(builder, accessIdWithoutLimit)(async fs => {
            const resultAccessId = `${accessIdWithoutLimit}-${limit}`;

            const qData = await (
                isEpisode ? fs.find(LIMITER_RESULT(path, dbUrl, dbName), resultAccessId, ['value']) :
                    fs.find(LIMITER_DATA(path, dbUrl, dbName), accessIdWithoutLimit, ['value'])
            ).catch(() => null);
            const thisData = qData && DatastoreParser.decode(qData.value);

            if (!thisData) return null;

            if (isEpisode) {
                await fs.set(LIMITER_RESULT(path, dbUrl, dbName), resultAccessId, { touched: Date.now() });
                return [thisData.data];
            }

            const { latest_limiter, data } = thisData;

            if (
                latest_limiter === undefined ||
                (Validator.POSITIVE_NUMBER(limit) && latest_limiter >= limit)
            ) {
                await fs.set(LIMITER_DATA(path, dbUrl, dbName), accessIdWithoutLimit, { touched: Date.now() });
                return [transformData(data)];
            }
        });

        return record || null;
    }

    if (isEpisode) {
        const resultData = grab(CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'episode', accessIdWithoutLimit, `${limit}`]);
        if (resultData) {
            resultData.touched = Date.now();
            return [basicClone(resultData.data)];
        }
        return null;
    }

    const instanceData = grab(CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'instance', accessIdWithoutLimit]);
    if (!instanceData) return null;
    const { latest_limiter, data } = instanceData;

    if (
        latest_limiter === undefined ||
        (Validator.POSITIVE_NUMBER(limit) && latest_limiter >= limit)
    ) {
        instanceData.touched = Date.now();
        return [transformData(data)];
    }

    return null;
};

export const generateRecordID = (builder, config, removeLimit) => {
    builder = builder && basicClone(builder);
    config = config && basicClone(config);

    const { command, path, countDoc } = builder;
    const { extraction, excludeFields, returnOnly } = config || {};

    const recordObj = Object.fromEntries(
        Object.entries({
            path,
            command,
            countDoc,
            extraction,
            excludeFields,
            returnOnly
        }).filter(([_, v]) => v !== undefined)
    );

    if (command) recordObj.command = arrangeCommands(command, removeLimit);
    if (extraction) {
        if (Array.isArray(extraction)) recordObj.extraction = extraction.map(v => arrangeCommands(v));
        else recordObj.extraction = arrangeCommands(extraction);
    }

    return niceHash(serializeToBase64(recordObj));
};

const arrangeCommands = (c, removeLimit) => {
    c = basicClone(c);
    const sortFind = f => {
        ['$and', '$or', '$nor'].forEach(n => {
            if (f[n]) {
                f[n] = f[n].map(v => sortObject(v));
            }
        });

        return sortObject(f);
    };
    if (c.sort) c.direction = [-1, 'desc', 'descending'].includes(c.direction) ? 'desc' : 'asc';
    if (c.find) c.find = sortFind(c.find);
    if (c.findOne) c.findOne = sortFind(c.findOne);
    if (removeLimit && ('limit' in c)) delete c.limit;
    return sortObject(c);
};

const sortObject = (o) => Object.fromEntries(
    Object.entries(o).sort(([a], [b]) => (a > b) ? 1 : (a < b) ? -1 : 0)
);

const recursiveFlat = (a) => {
    return a.map(v => Array.isArray(v) ? recursiveFlat(v) : v).flat();
};

const recurseNonAtomicWrite = (obj, i, type) => {
    if (!Validator.OBJECT(obj)) throw `expected a document but got ${obj}`;
    Object.entries(obj).forEach(([k, v]) => {
        if (!i) {
            if (k === '_id') throw `avoid providing "_id" for ${type}() operation as _id only reference a single document`;
            if (k === '_foreign_doc') throw '"_foreign_doc" is readonly';
        }
        if (k.includes('$') || k.includes('.')) {
            if (!(k === '$timestamp' && v === 'now'))
                throw `invalid property "${k}", ${type}() operation fields must not contain .$`;
        }
        if (Validator.OBJECT(v)) recurseNonAtomicWrite(v, i + 1, type);
    });
};

const recurseAtomicWrite = (obj, i, type) => {
    if (!Validator.OBJECT(obj)) throw `expected a document but got ${obj}`;
    Object.entries(obj).forEach(([k, v]) => {
        if (!i && !(k in AtomicWriter)) throw `Unknown update operator: ${k}`;
        if (i === 1) {
            if ((k === '_id' || k.startsWith('_id.')))
                throw `avoid providing "_id" for ${type}() operation as _id only reference a single document`;

            if (k === '_foreign_doc' || k.startsWith('_foreign_doc.'))
                throw '"_foreign_doc" is readonly';
        }
        if (k.includes('.$')) throw `unsupported operation at "${k}"`;
        if (!i || Validator.OBJECT(v)) recurseAtomicWrite(v, i + 1, type);
    });
};

const WriteValidator = {
    setOne: ({ value, type = 'setOne' }) => {
        if (!Validator.OBJECT(value)) throw `expected a document but got ${value}`;
        const { _id, ...rest } = value;

        if (_id === undefined || JSON.stringify(_id) === 'null')
            throw `_id requires a valid bson value but got ${_id}`;

        recurseNonAtomicWrite(rest, 0, type);
    },
    setMany: ({ value }) => {
        value.forEach(v => {
            WriteValidator.setOne({ value: v, type: 'setMany' });
        });
    },
    replaceOne: ({ find, value }) => {
        validateFilter(find);
        recurseNonAtomicWrite(value, 0, 'replaceOne');
    },
    putOne: ({ find, value }) => {
        validateFilter(find);
        recurseNonAtomicWrite(value, 0, 'putOne');
    },
    updateOne: ({ find, value }) => {
        validateFilter(find);
        recurseAtomicWrite(value, 0, 'updateOne');
    },
    updateMany: ({ find, value }) => {
        validateFilter(find);
        recurseAtomicWrite(value, 0, 'updateMany');
    },
    mergeOne: ({ find, value }) => {
        validateFilter(find);
        recurseAtomicWrite(value, 0, 'mergeOne');
    },
    mergeMany: ({ find, value }) => {
        validateFilter(find);
        recurseAtomicWrite(value, 0, 'mergeMany');
    },
    deleteOne: ({ find }) => {
        validateFilter(find);
    },
    deleteMany: ({ find }) => {
        validateFilter(find);
    }
};

export const validateWriteValue = ({ type, find, value }) => WriteValidator[type]({ find, value, type });

export const addPendingWrites = async (builder, writeId, result) => {
    builder = builder && basicClone(builder);
    result = result && basicClone(result);
    await awaitStore();

    const { projectUrl } = builder;
    const pendingSnapshot = basicClone(result);
    const { editions, linearWrite, pathChanges } = await syncCache(builder, result);

    const isStaticWrite = !linearWrite.some(({ value, type }) => {
        if (
            [
                'updateOne',
                'updateMany',
                'mergeOne',
                'mergeMany'
            ].includes(type)
        ) {
            const operators = Object.keys(value);
            return ['$inc', '$min', '$max', '$mul', '$pop', '$pull', '$push', '$rename'].includes(operators);
        }
    });
    const pureBuilder = {};

    ['path', 'dbUrl', 'dbName', 'find', 'extraHeaders', 'maxRetries'].forEach(v => {
        if (builder[v] !== undefined) pureBuilder[v] = builder[v];
    });
    pureBuilder.find = serializeToBase64({ _: pureBuilder.find });
    pendingSnapshot.value = serializeToBase64({ _: pendingSnapshot.value });

    let wasShifted;

    if (isStaticWrite) {
        // find previously matching pending write
        const entries = Object.entries(CacheStore.PendingWrites[projectUrl] || {});

        for (const [writeId, obj] of entries) {
            if (!Scoped.OutgoingWrites[writeId]) {
                if (
                    niceGuard(
                        { builder: obj.builder, snapshot: obj.snapshot },
                        { builder: pureBuilder, snapshot: pendingSnapshot }
                    )
                ) {
                    // shift it to the back
                    obj.addedOn = Date.now();
                    wasShifted = true;
                    break;
                }
            }
        }
    }

    if (!wasShifted)
        poke(CacheStore.PendingWrites, [projectUrl, writeId], basicClone({
            builder: pureBuilder,
            snapshot: pendingSnapshot,
            editions,
            addedOn: Date.now()
        }));

    updateCacheStore(['DatabaseStore', 'PendingWrites', 'DatabaseStats']);
    notifyDatabaseNodeChanges(builder, [...pathChanges]);
    sendMessage('database-sync', {
        builder: { ...pureBuilder, projectUrl },
        writeId,
        result: pendingSnapshot
    });
};

export const syncCache = async (builder, result) => {
    const { isMemory } = Scoped.ReleaseCacheData;
    const { projectUrl, dbUrl, dbName } = builder;
    const duplicateSets = {};
    const editions = [];
    const pathChanges = new Set([]);

    const linearWrite =
        result.type === 'batchWrite' ?
            result.value.map(({ scope, value, find, path }) =>
                ({ type: scope, value, find, path })
            )
            : [{ ...result, find: builder.find, path: builder.path }];

    const copiedWrite = basicClone(linearWrite);

    await Promise.all(linearWrite.map(async ({ value: writeObj, find, type, path }) => {
        WriteValidator[type]({ find, value: writeObj });
        validateCollectionName(path);
        pathChanges.add(path);

        if (isMemory) {
            const colObj = grab(CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'instance']);

            if (colObj)
                await Promise.all(
                    Object.entries(colObj).map(e =>
                        MutateDataInstance(
                            e,
                            path =>
                                Object.values(
                                    grab(CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'instance'], {})
                                ).map(({ data }) => data).flat()
                        )
                    )
                );
        } else {
            const colListing = await getSystem(builder).list(LIMITER_DATA(path, dbUrl, dbName), []).catch(() => []);
            const pathFinder = {};

            await Promise.all(colListing.map(async ([access_id]) =>
                useFS(builder, access_id)(async fs => {
                    const data = await fs.find(LIMITER_DATA(path, dbUrl, dbName), access_id, ['value'])
                        .then(r => DatastoreParser.decode(r.value));

                    await MutateDataInstance([access_id, data], path =>
                        pathFinder[path] || (
                            pathFinder[path] = fs.list(LIMITER_DATA(path, dbUrl, dbName), ['value'])
                                .then(v => v.map(d => DatastoreParser.decode(d[1].value).data).flat())
                                .catch(() => [])
                        )
                    );
                    await fs.set(LIMITER_DATA(path, dbUrl, dbName), access_id, {
                        touched: Date.now(),
                        value: DatastoreParser.encode(data),
                        size: data.size
                    });
                })
            ));
        }

        async function MutateDataInstance([entityId, dataObj], pathGetter) {
            const { data: instance_data, command, config } = dataObj;
            const entityFind = command.findOne || command.find;
            const { extraction } = config || {};

            const logChanges = (d) => {
                editions.push(basicClone([entityId, d, path]));
                const [b4, af] = d;
                const offset = docSize(af) - docSize(b4);
                dataObj.size += offset;
                incrementDatabaseSize(builder, path, offset);
            };

            const snipUpdate = doc => snipDocument(doc, entityFind, config);

            const accessExtraction = async obj => {
                const buildAssignedExtraction = (data) => {
                    const d = (Array.isArray(extraction) ? extraction : [extraction]).map(thisExtraction => {
                        const query = basicClone(thisExtraction);

                        ['find', 'findOne'].forEach(n => {
                            if (query[n])
                                query[n] = assignExtractionFind(data, query[n]);
                        });
                        return arrangeCommands(query);
                    });
                    if (Array.isArray(extraction)) return d;
                    return d[0];
                }
                const extractionResultant = buildAssignedExtraction(obj);
                const extractionBinary = serializeToBase64({ _: extractionResultant });

                const sameProjection = instance_data.find(({ _foreign_doc, ...restDoc }) =>
                    extractionBinary === serializeToBase64({ _: buildAssignedExtraction(restDoc) })
                );

                if (sameProjection) return sameProjection._foreign_doc;

                // if no matching extraction was found, proceed to scrapping each _foreign_doc segment
                const scrapedProjection = await Promise.all((Array.isArray(extractionResultant) ? extractionResultant : [extractionResultant]).map(async (query, i) => {
                    const { sort, direction, limit, find, findOne, collection: path } = query;
                    let scrapDocs = [];

                    instance_data.forEach(({ _foreign_doc }) => {
                        _foreign_doc = (Array.isArray(_foreign_doc) ? _foreign_doc : [_foreign_doc])[i];

                        recursiveFlat([_foreign_doc]).forEach(e => {
                            if (e && confirmFilterDoc(e, find || findOne)) {
                                scrapDocs.push(e);
                            }
                        });
                    });

                    if (!scrapDocs.length) {
                        // if no matching extraction was found, proceed to scrapping ancestor path
                        (await pathGetter(path)).forEach(({ _foreign_doc, ...doc }) => {
                            if (confirmFilterDoc(doc, find || findOne)) {
                                scrapDocs.push(doc);
                            }
                        });
                    }
                    scrapDocs = scrapDocs.filter((v, i, a) => a.findIndex(b => b._id === v._id) === i);
                    if (sort) sortArrayByObjectKey(scrapDocs, sort);
                    if ([-1, 'desc', 'descending'].includes(direction)) scrapDocs.reverse();
                    if (limit) scrapDocs = scrapDocs.slice(0, limit);
                    scrapDocs = scrapDocs.map(v => snipDocument(v, find || findOne, query));

                    return findOne ? scrapDocs[0] : scrapDocs;
                }));

                return basicClone(Array.isArray(extraction) ? scrapedProjection : scrapedProjection[0]);
            }

            if (['setOne', 'setMany'].includes(type)) {
                await Promise.all((type === 'setOne' ? [writeObj] : writeObj).map(async e => {
                    const obj = deserializeNonAtomicWrite(e);
                    if (extraction) obj._foreign_doc = await accessExtraction(obj);

                    if (confirmFilterDoc(obj, entityFind)) {

                        if (instance_data.findIndex(v => CompareBson.equal(v._id, e._id)) === -1) {
                            const x = snipUpdate(obj);
                            instance_data.push(basicClone(x));
                            logChanges([undefined, x]);
                        } else if (!duplicateSets[e._id]) {
                            console.warn(`document with _id=${e._id} already exist locally with ${type}() operation, skipping to online commit`);
                            duplicateSets[e._id] = true;
                        }
                    }
                }));
                return;
            }

            if (['putOne', 'replaceOne'].includes(type)) {
                const extras = createWriteFromFind(find);

                let deletions = 0;
                const cdata = instance_data.slice(0);

                for (let i = 0; i < cdata.length; i++) {
                    const doc = cdata[i];

                    if (confirmFilterDoc(doc, find)) {
                        const obj = deserializeNonAtomicWrite({
                            ...extras,
                            ...writeObj,
                            ...'_id' in extras ? {} : { _id: doc._id }
                        });
                        if (extraction) obj._foreign_doc = await accessExtraction(obj);

                        if (confirmFilterDoc(obj, entityFind)) {
                            const x = snipUpdate(obj);
                            instance_data[i - deletions] = x;
                            logChanges([doc, x]);
                        } else {
                            instance_data.splice(i - deletions++, 1);
                            logChanges([doc, undefined]);
                        }
                        return;
                    }
                }

                if (type === 'putOne') {
                    const obj = deserializeNonAtomicWrite({
                        ...extras,
                        ...writeObj,
                        ...'_id' in extras ? {} : { _id: new ObjectId() }
                    });
                    if (extraction) obj._foreign_doc = await accessExtraction(obj);

                    if (confirmFilterDoc(obj, entityFind)) {
                        const x = snipUpdate(obj);
                        instance_data.push(x);
                        logChanges([undefined, x]);
                    }
                }
                return;
            }

            if (['deleteOne', 'deleteMany'].includes(type)) {
                let deletions = 0;
                const cdata = instance_data.slice(0);

                for (let i = 0; i < cdata.length; i++) {
                    const doc = cdata[i];
                    if (confirmFilterDoc(doc, find)) {
                        instance_data.splice(i - deletions++, 1);
                        logChanges([doc, undefined]);
                        if (type === 'deleteOne') return;
                    }
                }
                return;
            }

            let founded;
            let deletions = 0;
            const cdata = instance_data.slice(0);

            for (let i = 0; i < cdata.length; i++) {
                const doc = cdata[i];
                if (confirmFilterDoc(doc, find)) {
                    const obj = deserializeAtomicWrite(doc, deserializeWriteValue(writeObj), false, type);
                    if (extraction) obj._foreign_doc = await accessExtraction(obj);

                    if (confirmFilterDoc(obj, entityFind)) {
                        const x = snipUpdate(obj);
                        instance_data[i - deletions] = x;
                        logChanges([doc, x]);
                    } else {
                        instance_data.splice(i - deletions++, 1);
                        logChanges([doc, undefined]);
                    }

                    founded = true;
                    if (type.endsWith('One')) return;
                }
            }

            if (!founded && type.startsWith('merge')) {
                const extras = createWriteFromFind(find);
                const obj = {
                    ...extras,
                    ...deserializeAtomicWrite(
                        { _id: '_id' in extras ? extras._id : new ObjectId() },
                        deserializeWriteValue(writeObj),
                        true,
                        type
                    )
                };
                if (extraction) obj._foreign_doc = await accessExtraction(obj);

                if (confirmFilterDoc(obj, entityFind)) {
                    const x = snipUpdate(obj);
                    instance_data.push(x);
                    logChanges([undefined, x]);
                }
            }
        };
    }));

    return {
        editions,
        pathChanges: [...pathChanges],
        linearWrite: copiedWrite
    };
}

export const removePendingWrite = async (builder, writeId, revert) => {
    await awaitStore();
    const { projectUrl } = builder;
    const pendingData = grab(CacheStore.PendingWrites, [projectUrl, writeId]);
    if (!pendingData) return;

    const pathChanges = revert ? await revertChanges(builder, pendingData.editions) : [];

    unpoke(CacheStore.PendingWrites, [projectUrl, writeId]);
    updateCacheStore(['PendingWrites', 'DatabaseStore', 'DatabaseStats']);
    notifyDatabaseNodeChanges(builder, [...pathChanges]);
    sendMessage('database-revert', { writeId, revert });
};

export const revertChanges = async (builder, pendingData) => {
    const { isMemory } = Scoped.ReleaseCacheData;
    const { projectUrl, dbUrl, dbName } = builder;
    const pathChanges = new Set([]);

    await Promise.all(pendingData.map(async ([access_id, [b4Doc, afDoc], path]) => {
        if (isMemory) {
            RevertMutation(grab(CacheStore.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'instance', access_id]));
        } else {
            await useFS(builder, access_id)(async fs => {
                const colObj = await fs.find(LIMITER_DATA(path, dbUrl, dbName), access_id, ['value'])
                    .then(v => DatastoreParser.decode(v.value))
                    .catch(() => null);
                if (!colObj) return;
                RevertMutation(colObj);
                await fs.set(LIMITER_DATA(path, dbUrl, dbName), access_id, {
                    value: DatastoreParser.encode(colObj),
                    touched: Date.now(),
                    size: colObj.size
                });
            });
        }

        function RevertMutation(colObj) {
            const colList = colObj?.data;

            const updateSize = (b4, af) => {
                const offset = docSize(af) - docSize(b4);
                colObj.size += offset;
                incrementDatabaseSize(builder, path, offset);
            }

            if (colList) {
                if (afDoc) {
                    const editedIndex = colList.findIndex(e => CompareBson.equal(e._id, afDoc._id));
                    if (editedIndex !== -1) {
                        if (
                            serializeToBase64(afDoc) === serializeToBase64(colList[editedIndex])
                        ) {
                            if (b4Doc) {
                                colList[editedIndex] = b4Doc;
                                updateSize(afDoc, b4Doc);
                            } else {
                                colList.splice(editedIndex, 1);
                                updateSize(afDoc, undefined);
                            }
                        }
                    }
                } else if (
                    b4Doc &&
                    colList.findIndex(e => CompareBson.equal(e._id, b4Doc._id)) === -1
                ) {
                    colList.push(b4Doc);
                    updateSize(undefined, b4Doc);
                }
            }
            pathChanges.add(path);
        }
    }));

    return [...pendingData];
}

export const notifyDatabaseNodeChanges = (builder, changedCollections = []) => {
    const { projectUrl, dbName, dbUrl } = builder;

    changedCollections.forEach(path => {
        const nodeID = `${projectUrl}_${dbName}_${dbUrl}_${path}`;
        Object.entries(Scoped.ActiveDatabaseListeners[nodeID] || {})
            .sort((a, b) => a[1] - b[1])
            .forEach(([processId]) => {
                DatabaseRecordsListener.dispatch('d', processId);
            });
    });
};

const createWriteFromFind = (find) => {
    let result = {};

    Object.entries(find).forEach(([k, v]) => {
        if (['$and', '$or'].includes(k)) {
            v.forEach(e => {
                result = { ...result, ...createWriteFromFind(e) };
            });
        } else if (!k.startsWith('$')) {
            if (Validator.OBJECT(v)) {
                if (!Object.keys(v).some(v => v.startsWith('$'))) {
                    result[k] = v;
                } else if ('$eq' in v) {
                    result[k] = v.$eq;
                }
            } else {
                result[k] = v instanceof RegExp ? new BSONRegExp(v.source, v.flags) : v;
            }
        }
    });

    return result;
};

const snipDocument = (data, find, config) => {
    if (!data || !config) return data;
    const { returnOnly, excludeFields } = config || {};

    let output = basicClone(data);

    if (returnOnly) {
        output = {};
        (Array.isArray(returnOnly) ? returnOnly : [returnOnly]).filter(v => v).forEach(e => {
            const thisData = grab(data, e);
            if (thisData) poke(output, e, thisData);
        });
    } else if (excludeFields) {
        (Array.isArray(excludeFields) ? excludeFields : [excludeFields]).filter(v => v).forEach(e => {
            if (grab(data, e) && e !== '_id') unpoke(output, e);
        });
    }

    getFindFields(find).forEach(field => {
        if (!grab(output, field)) {
            const mainData = grab(data, field);
            if (mainData !== undefined) poke(output, field, mainData);
        }
    });

    return output;
};

const getFindFields = (find) => {
    const result = ['_id'];

    Object.entries(find).forEach(([k, v]) => {
        if (['$and', '$or', '$nor'].includes(k)) {
            v.forEach(e => {
                result.push(...getFindFields(e));
            });
        } else if (k === '$text') {
            result.push(...Array.isArray(v.$field) ? v.$field : [v.$field]);
        } else if (!k.startsWith('$')) {
            result.push(k);
        }
    });

    return result.filter((v, i, a) => a.findIndex(b => b === v) === i);
};

const deserializeWriteValue = (value) => {
    if (!value) return value;

    if (niceGuard(TIMESTAMP, value)) {
        return Date.now();
    } else if (Validator.OBJECT(value)) {
        return Object.fromEntries(
            Object.entries(value).map(([k, v]) =>
                Validator.JSON(v) ? [k, deserializeWriteValue(v)] : [k, v]
            )
        );
    } else if (Array.isArray(value)) {
        return value.map(deserializeWriteValue);
    } else return value;
}

const deserializeNonAtomicWrite = (writeObj) => deserializeWriteValue(writeObj);

const deserializeAtomicWrite = (b4Doc, writeObj, isNew, type) => {
    const resultantDoc = { ...b4Doc };

    Object.entries(writeObj).forEach(([key, value]) => {
        if (key in AtomicWriter) {
            if (Validator.OBJECT(value)) {
                Object.entries(value).forEach(([k, v]) => {
                    AtomicWriter[key](k, v, resultantDoc, isNew, type);
                });
            } else throw `expected an object at ${key} but got ${value}`;
        } else if (key.startsWith('$')) {
            throw `Unknown update operator: ${key}`;
        } else throw 'MongoInvalidArgumentError: Update document requires atomic operators';
    });

    return resultantDoc;
};

const AtomicWriter = {
    $currentDate: (field, value, object) => {
        const isDate = value === true || niceGuard({ $type: "date" }, value);
        const isTimestamp = niceGuard({ $type: "timestamp" }, value);

        if (
            !isDate &&
            !isTimestamp
        ) throw `invalid value at $currentDate.${field}, expected any of boolean (true), { $type: "timestamp" } or { $type: "date" } but got ${value}`;
        poke(object, field, isDate ? new Date() : new Timestamp({ t: Math.floor(Date.now() / 1000), i: 0 }));
    },
    $inc: (field, value, object) => {
        const current = grab(object, field);
        if (current === null) {
            console.warn(`cannot use $inc operator on a null value at ${field}`);
            return;
        }
        const castedCurrent = downcastBSON(current);
        const castedValue = downcastBSON(value);

        if (!Validator.NUMBER(castedValue)) throw `expected a number at $inc.${field} but got ${value}`;

        poke(object, field, Validator.NUMBER(castedCurrent) ? defaultBSON(castedCurrent + castedValue, current) : value);
    },
    $min: (field, value, object) => {
        const current = grab(object, field);
        if (CompareBson.lesser(value, current)) {
            poke(object, field, value);
        }
    },
    $max: (field, value, object) => {
        const current = grab(object, field);
        if (CompareBson.greater(value, current)) {
            poke(object, field, value);
        }
    },
    $mul: (field, value, object) => {
        const current = grab(object, field);
        const castedValue = downcastBSON(value);
        const castedCurrent = downcastBSON(current);

        if (!Validator.NUMBER(castedValue))
            throw `expected a number at $mul.${field} but got ${value}`;

        poke(object, field, Validator.NUMBER(castedCurrent) ? defaultBSON(castedCurrent * castedValue, value) : 0);
    },
    $rename: (field, value, object) => {
        if (!Validator.EMPTY_STRING(value))
            throw `expected a non-empty string at $rename.${field} but got ${value}`;
        const destStage = value.split('.');
        const sourceStage = field.split('.');

        sourceStage.forEach((e, i, a) => {
            if (a.length !== destStage.length)
                throw `dotnotation mismatch for ${value}`;
            if (i !== a.length - 1) {
                if (e !== destStage[i])
                    throw `dotnotation mismatch at ${destStage[i]}, expected "${e}"`;
            }
            if (!e) throw `empty node for ${field}`;
        });
        const [tipObj, tipSource, tipDest] = destStage.length === 1 ? [object, field, value]
            : [grab(object, destStage.slice(0, -1).join('.')), sourceStage.slice(-1)[0], destStage.slice(-1)[0]];

        if (tipObj && tipSource in tipObj) {
            tipObj[tipDest] = basicClone(tipObj[tipSource]);
            delete tipObj[tipSource];
        }
    },
    $set: (field, value, object) => {
        poke(object, field, value === undefined ? null : value);
    },
    $setOnInsert: (field, value, object, isNew) => {
        if (isNew) AtomicWriter.$set(field, value, object);
    },
    $unset: (field, _, object) => {
        unpoke(object, field);
    },
    $addToSet: (field, value, object) => {
        const current = grab(object, field);
        if (Array.isArray(current)) {
            if (
                Validator.OBJECT(value) &&
                Object.keys(value).length === 1 &&
                '$each' in value
            ) {
                const { $each } = value;
                if (!Array.isArray($each))
                    throw `expected an array at "$addToSet.${field}.$each" but got ${$each}`;
                $each.forEach(e => {
                    if (!current.some(v => CompareBson.equal(v, e))) {
                        current.push(e);
                    }
                });
            } else if (!current.some(v => CompareBson.equal(v, value))) {
                current.push(value);
            }
        }
    },
    $pop: (field, value, object) => {
        if (![1, -1].includes(value)) throw `expected 1 or -1 at "$pop.${field}" but got ${value}`;
        const current = grab(object, field);
        if (
            Array.isArray(current) &&
            current.length
        ) current[value === 1 ? 'pop' : 'shift']();
    },
    $pull: (field, value, object) => {
        // TODO: issues
        const current = grab(object, field);
        const isQueryObject = Validator.OBJECT(value);

        if (
            Array.isArray(current) &&
            current.length
        ) {
            const remainingCurrent = current.filter(v => {
                const isThisObject = Validator.OBJECT(v);

                try {
                    if (
                        confirmFilterDoc(
                            isThisObject ? v : { __x_: v },
                            (isThisObject && isQueryObject) ? value : { __x_: value }
                        )
                    ) {
                        return false;
                    }
                } catch (_) { }
                return true;
            });
            poke(object, field, remainingCurrent);
        }
    },
    $push: (field, value, object) => {
        const current = grab(object, field);

        if (Array.isArray(current)) {
            if (Validator.OBJECT(value)) {
                const { $each, $sort, $slice, $position, ...rest } = value;
                if (Object.keys(rest).length)
                    throw `unknown property "${Object.keys(rest)}" at $push.${field}`;

                if ($position !== undefined) {
                    if (Validator.INTEGER($position))
                        throw '$position must have an integer value';
                    if (!$each) throw '$position operator requires an $each operator';
                }
                if ($each !== undefined) {
                    if (!Array.isArray($each))
                        throw `expected an array at "$push.${field}.$each" but got ${$each}`;
                    if ($position !== undefined) {
                        current.splice($position, 0, ...$each);
                    } else current.push(...$each);
                }
                if ($sort !== undefined) {
                    if (!$each) throw '$sort operator requires an $each operator';
                    if ([1, -1].includes($sort)) {
                        current.sort();
                        if ($sort === -1) current.reverse();
                    } else if (Validator.OBJECT($sort)) {
                        if (Object.keys($sort).length !== 1)
                            throw 'number of object keys in a $sort must be one';

                        Object.entries($sort).forEach(([k, v]) => {
                            sortArrayByObjectKey(current, k);
                            if (v === -1) current.reverse();
                        });
                    } else throw `expected either 1, -1 or an object at "$push.${field}.$sort" but got ${$sort}`;
                }
                if ($slice) {
                    if (Validator.POSITIVE_INTEGER($slice))
                        throw `$slice operator requires a positive integer but got ${$slice}`;
                    current.splice($slice);
                }
            } else current.push(value);
        }
    },
    $pullAll: (field, value, object) => {
        if (!Array.isArray(value))
            throw `expected an array at $pullAll.${field}`;

        const current = grab(object, field);

        if (Array.isArray(current)) {
            const remainingCurrent = current.filter(v =>
                !value.some(k => CompareBson.equal(v, k))
            );
            poke(object, field, remainingCurrent);
        }
    }
};
