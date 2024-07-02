export const Scoped = {
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
    }
}

export const CacheStore = {
    DatabaseStore: {},
    DatabaseRecords: {},
    DatabaseCountResult: {},
    AuthStore: {},
    PendingWrites: {},
    FetchedStore: {}
}

export const CacheConstant = { ...CacheStore };