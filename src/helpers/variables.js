
export const Scoped = {
    serverTimeOffset: undefined,
    AnyProcessIte: 0,
    IS_CONNECTED: {},
    AreYouOkPromise: {},
    InitializedProject: {},
    ReleaseCacheData: undefined,
    AuthJWTToken: {},
    AuthData: {},
    IsStoreReady: false,
    TokenRefreshTimer: {},
    TokenRefreshProcess: {},
    TokenTimestamping: {},
    InitiatedForcedToken: {},
    PendingFetchCollective: {},
    PendingDbReadCollective: {},
    ActiveDatabaseListeners: {},
    OutgoingWrites: {},
    /**
     * @type {Promise<any> | undefined}
     */
    dispatchingWritesPromise: {},
    linearFsProcess: {
        database: {},
        dbQueryCount: {},
        httpFetch: {}
    }
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
    /**
     * [the instance url]: the url been emulated
     */
    EmulatedAuth: {},
    PendingWrites: {},
    FetchedStore: {}
};

export const PACKAGES = {
    tweetnacl: undefined
};