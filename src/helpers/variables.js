
export const Scoped = {
    serverTimeOffset: undefined,
    PendingIte: 0,
    AnyProcessIte: 0,
    IS_CONNECTED: {},
    IS_TOKEN_READY: {},
    InitializedProject: {},
    ReleaseCacheData: undefined,
    IsStoreReady: false,
    AuthJWTToken: {},
    cacheStorageReducer: undefined,
    TokenRefreshTimer: {},
    LastTokenRefreshRef: {},
    StorageProcessID: 0,
    InitiatedForcedToken: {},
    PendingFetchCollective: {},
    PendingDbReadCollective: {},
    ActiveDatabaseListeners: {},
    OutgoingWrites: {},
    /**
     * @type {Promise<any> | undefined}
     */
    dispatchingWritesPromise: undefined,
    broadcastedWrites: {}
};

export const CacheStore = {
    DatabaseStore: {},
    DatabaseCountResult: {},
    DatabaseStats: {
        /**
         * @type {{[projectUrl: string]: {[dbUrl: string]: {[dbName: string]: {[path: string]: number}}}}}
         */
        database: {},
        /**
         * @type {{[projectUrl: string]: {[dbUrl: string]: {[dbName: string]: {[path: string]: boolean}}}}}
         */
        counters: {},
        /**
         * @type {{[projectUrl: string]: number}}
         */
        fetchers: {},
        _db_size: 0,
        _fetcher_size: 0
    },
    AuthStore: {},
    PendingAuthPurge: {},
    EmulatedAuth: {},
    PendingWrites: {},
    FetchedStore: {}
};