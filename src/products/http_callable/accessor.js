import { updateCacheStore } from "../../helpers/utils";
import { CacheStore } from "../../helpers/variables";
import cloneDeep from "lodash/cloneDeep";
import { serialize } from "entity-serializer";
import { incrementFetcherSize } from "./counter";

export const insertFetchResources = async (projectUrl, access_id, value) => {
    value = cloneDeep(value);
    const data = serialize(value).toString('base64');

    if (!CacheStore.FetchedStore[projectUrl])
        CacheStore.FetchedStore[projectUrl] = {};
    const b4 = CacheStore.FetchedStore[projectUrl][access_id];
    incrementFetcherSize(projectUrl, data.length - (b4?.size || 0));
    CacheStore.FetchedStore[projectUrl][access_id] = {
        touched: Date.now(),
        data: value,
        size: data.length
    };

    updateCacheStore(undefined, ['FetchedStore']);
}

export const getFetchResources = async (projectUrl, access_id) => {
    const record = CacheStore.FetchedStore[projectUrl]?.[access_id];
    if (record) record.touched = Date.now();
    return record && cloneDeep(record?.data);
}