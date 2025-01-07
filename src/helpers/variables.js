
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
    PendingFetchCollective: {
        pendingProcess: {},
        pendingResolution: {}
    },
    PendingDbReadCollective: {
        pendingProcess: {},
        pendingResolution: {}
    },
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
    DatabaseStats: {},
    AuthStore: {},
    PendingAuthPurge: {},
    EmulatedAuth: {},
    PendingWrites: {},
    FetchedStore: {}
};