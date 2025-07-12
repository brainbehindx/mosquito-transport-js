import { updateCacheStore } from "../../helpers/utils";
import { CacheStore, Scoped } from "../../helpers/variables";
import cloneDeep from "lodash/cloneDeep";
import { serialize } from "entity-serializer";
import { incrementFetcherSize } from "./counter";
import { FS_PATH, useFS } from "../../helpers/fs_manager";

const { FETCHERS } = FS_PATH;

export const insertFetchResources = async (projectUrl, access_id, value) => {
    value = cloneDeep(value);
    const dataSize = serialize(value).byteLength;

    const { isMemory } = Scoped.ReleaseCacheData;
    if (isMemory) {
        if (!CacheStore.FetchedStore[projectUrl])
            CacheStore.FetchedStore[projectUrl] = {};
        const b4 = CacheStore.FetchedStore[projectUrl][access_id];
        incrementFetcherSize(projectUrl, dataSize - (b4?.size || 0));
        CacheStore.FetchedStore[projectUrl][access_id] = {
            touched: Date.now(),
            data: value,
            size: dataSize
        };
        updateCacheStore(['FetchedStore', 'DatabaseStats']);
    } else {
        await useFS(projectUrl, access_id)(async fs => {
            const b4Data = await fs.find(FETCHERS, access_id, ['size']).catch(() => null);

            await fs.set(FETCHERS, access_id, { value, size: dataSize, touched: Date.now() });
            incrementFetcherSize(projectUrl, dataSize - (b4Data?.size || 0));
        });
        updateCacheStore(['DatabaseStats']);
    }
}

export const getFetchResources = async (projectUrl, access_id) => {
    const { isMemory } = Scoped.ReleaseCacheData;

    if (isMemory) {
        const record = CacheStore.FetchedStore[projectUrl]?.[access_id];
        if (record) record.touched = Date.now();
        updateCacheStore(['FetchedStore']);
        return record && cloneDeep(record?.data);
    }

    const res = await useFS(projectUrl, access_id)(async fs => {
        const query = await fs.find(FETCHERS, access_id, ['value']).catch(() => null);
        if (!query) return null;

        await fs.set(FETCHERS, access_id, { touched: Date.now() });
        return query.value;
    });
    return res;
}