import { Validator } from "guard-object";
import { incrementDatabaseSizeCore } from "../products/database/counter";
import { incrementFetcherSizeCore } from "../products/http_callable/counter";
import unsetLodash from 'lodash/unset';

export const purgeRedundantRecords = async (data, builder) => {
    const { maxLocalDatabaseSize = 10485760, maxLocalFetchHttpSize = 10485760 } = builder;

    /**
     * @type {import('./variables')['CacheStore']['DatabaseStats']}
     */
    const { _db_size, _fetcher_size } = data.DatabaseStats || {};

    const purgeDatabase = () => {
        if (!Validator.POSITIVE_NUMBER(_db_size) || !maxLocalDatabaseSize || _db_size < maxLocalDatabaseSize) return;
        const DbListing = [];

        breakDbMap(data.DatabaseStore, (projectUrl, dbUrl, dbName, path, value) => {
            Object.entries(value.instance).forEach(([access_id, obj]) => {
                DbListing.push({
                    builder: { projectUrl, dbUrl, dbName },
                    path,
                    access_id,
                    value: obj
                });
            });
            Object.entries(value.episode).forEach(([access_id, limitObj]) => {
                Object.entries(limitObj).forEach(([limit, obj]) => {
                    DbListing.push({
                        builder: { projectUrl, dbUrl, dbName },
                        path,
                        access_id,
                        limit,
                        value: obj,
                        isEpisode: true
                    });
                });
            });
        });

        breakDbMap(data.DatabaseCountResult, (projectUrl, dbUrl, dbName, path, value) => {
            Object.entries(value).forEach(([access_id, obj]) => {
                DbListing.push({
                    builder: { projectUrl, dbUrl, dbName },
                    path,
                    access_id,
                    value: obj,
                    isCount: true
                });
            });
        });

        const redundantDbRanking = DbListing.sort((a, b) =>
            a.value.touched - b.value.touched
        );

        const newSize = maxLocalDatabaseSize / 2;
        let sizer = _db_size;
        let cuts = 0;

        for (let i = 0; i < redundantDbRanking.length; i++) {
            sizer -= redundantDbRanking[i].value.size || 0;
            ++cuts;
            if (sizer < newSize) break;
        }

        console.warn(`purging ${cuts} of ${redundantDbRanking.length} db entities`);
        redundantDbRanking.slice(0, cuts).forEach(({
            builder,
            path,
            access_id,
            isCount,
            isEpisode,
            limit,
            value: { size }
        }) => {
            const { projectUrl, dbUrl, dbName } = builder;
            if (isCount) {
                unsetLodash(data.DatabaseCountResult, [projectUrl, dbUrl, dbName, path, access_id]);
            } else {
                incrementDatabaseSizeCore(data.DatabaseStats, builder, path, -size);
                if (isEpisode) {
                    unsetLodash(data.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'episode', access_id, limit]);
                } else {
                    unsetLodash(data.DatabaseStore, [projectUrl, dbUrl, dbName, path, 'instance', access_id]);
                }
            }
        });
    }
    const purgeFetcher = () => {
        if (!Validator.POSITIVE_NUMBER(_fetcher_size) || !maxLocalFetchHttpSize || _fetcher_size < maxLocalFetchHttpSize) return;
        const redundantFetchRanking = Object.entries(data.FetchedStore).map(([projectUrl, access_id_Obj]) =>
            Object.entries(access_id_Obj).map(([access_id, data]) => ({
                access_id,
                projectUrl,
                data
            }))
        ).flat().sort(([a], [b]) =>
            a.data.touched - b.data.touched
        );

        const newSize = maxLocalFetchHttpSize / 2;
        let sizer = _fetcher_size;
        let cuts = 0;

        for (let i = 0; i < redundantFetchRanking.length; i++) {
            sizer -= redundantFetchRanking[i].data.size || 0;
            ++cuts;
            if (sizer < newSize) break;
        }

        console.warn(`purging ${cuts} of ${redundantFetchRanking.length} fetcher entities`);
        redundantFetchRanking.slice(0, cuts).forEach(({ access_id, data: { size }, projectUrl }) => {
            incrementFetcherSizeCore(data.DatabaseStats, projectUrl, -size);
            unsetLodash(data.FetchedStore, [projectUrl, access_id]);
        });
        console.log('fetcher purging complete');
    }
    purgeDatabase();
    purgeFetcher();
}

const breakDbMap = (obj, callback) =>
    Object.entries(obj).forEach(([projectUrl, dbUrlObj]) => {
        Object.entries(dbUrlObj).forEach(([dbUrl, dbNameObj]) => {
            Object.entries(dbNameObj).forEach(([dbName, pathObj]) => {
                Object.entries(pathObj).forEach(([path, value]) => {
                    callback(projectUrl, dbUrl, dbName, path, value);
                });
            });
        });
    });

export const purgeInstance = (projectUrl) => {
    // TODO: purge when signed-out
}