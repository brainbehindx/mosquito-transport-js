interface MTConfig {
    dbName?: string;
    dbUrl?: string;
    projectUrl: string;
    /**
     * disable caching for database and fetchHttp in this instance.
     * 
     * defaults to `false` but `true` in scenerio where an invoked fetchHttp does have a request body and disableCache is undefined
     */
    disableCache?: boolean;
    /**
     * maximum numbers of attempts to retry sending a request
     */
    maxRetries?: number;
    /**
     * setting this to true will encrypt all outgoing and incoming request. This enables end-to-end encryption using [Tweetnacl](https://github.com/dchest/tweetnacl-js) and to prevent request interception by browser extensions, network intermediaries or other hijacking tools
     */
    enableE2E_Encryption?: boolean;
    /**
     * this is the base64 public key for end-to-end encryption on the server
     */
    serverE2E_PublicKey?: string;
    /**
     * extra headers that will be appended to all outgoing request in this instance
     */
    extraHeaders?: {
        [key: string]: string
    };
    /**
     * true to deserialize BSON values to their Node.js closest equivalent types
     * 
     * @default true
     */
    castBSON?: boolean;
}

interface GetDatabase {
    collection: (path: string) => MTCollection;
}

interface mtimestamp { $timestamp: 'now' }

export const TIMESTAMP: mtimestamp;
export function TIMESTAMP_OFFSET(offset: number): { $timestamp_offset: number };
export function DOCUMENT_EXTRACTION(path: string): { $dynamicValue: string };

type longitude = number;
type latitude = number;

export function GEO_JSON(latitude: latitude, longitude: longitude): {
    type: "Point",
    coordinates: [longitude, latitude],
};

export function FIND_GEO_JSON(coordinates: [latitude, longitude], offSetMeters: number, centerMeters?: number): {
    $nearSphere: {
        $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
        },
        $minDistance: number | 0,
        $maxDistance: number
    }
};

export const AUTH_PROVIDER_ID: auth_provider_id;

/**
 * useful for avoiding encrypting data and extra overhead
 */
export class DoNotEncrypt {
    value: any;
}

interface auth_provider_id {
    GOOGLE: 'google';
    FACEBOOK: 'facebook';
    PASSWORD: 'password';
    TWITTER: 'x';
    GITHUB: 'github';
    APPLE: 'apple';
}

type auth_provider_id_values = auth_provider_id['GOOGLE'] |
    auth_provider_id['FACEBOOK'] |
    auth_provider_id['PASSWORD'] |
    auth_provider_id['GITHUB'] |
    auth_provider_id['TWITTER'] |
    auth_provider_id['APPLE'];

interface ReleaseCacheOption_IO {
    /**
     * This password will be used to encrypt data stored locally
     */
    cachePassword?: string;
    io: {
        /**
         * feeds mosquito-transport data
         */
        input: () => string;
        /**
         * emits mosquito-transport internal data
         */
        output: (data: string) => void;
    };
}

interface ReleaseCacheOption {
    /**
     * This password will be used to encrypt data stored locally
     */
    cachePassword?: string;
    /**
     * select the mechanism for storing data locally
     * - local-storage: uses [@react-native-async-storage/async-storage]() for storing data
     */
    cacheProtocol?: 'local-storage' | 'indexdb';
    /**
     * the maximum database size
     */
    heapMemory?: number;
    /**
     * true to cache database and {@link MosquitoTransport.fetchHttp} data.
     * the value only applies to in-memory storage protocol such as `io` and `local-storage`
     * 
     * @default false
     */
    promoteCache?: boolean;
}

interface MTSocket {
    timeout: (timeout?: number) => ({
        emitWithAck: (...args: any) => Promise<any>;
    });
    emit: (...args: any) => void;
    emitWithAck: (...args: any) => Promise<any>;
    on: (route: string, callback?: () => any) => void;
    once: (route: string, callback?: () => any) => void;
    destroy: () => void;
}

interface BatchWriteValue {
    scope: 'setOne' | 'setMany' | 'updateOne' | 'mergeOne' | 'deleteOne' | 'deleteMany' | 'replaceOne' | 'putOne';
    find?: DocumentFind;
    value?: DocumentWriteValue[] | DocumentWriteValue;
    path: string;
}

interface BatchWriteConfig extends WriteConfig {
    stepping?: boolean;
}

export class MosquitoTransport {
    constructor(config: MTConfig);
    static initializeCache(option?: ReleaseCacheOption | ReleaseCacheOption_IO): void;
    getDatabase(dbName?: string, dbUrl?: string): GetDatabase;
    collection(path: string): MTCollection;
    auth(): MTAuth;
    storage(): MTStorage;
    fetchHttp(endpoint: string, init?: RequestInit, config?: FetchHttpConfig): Promise<Response>;
    listenReachableServer(callback: (reachable: boolean) => void): () => void;
    getSocket(options: { disableAuth?: boolean; authHandshake?: Object }): MTSocket;
    onConnect: () => CollectionIO;
    batchWrite(map: BatchWriteValue[], config?: BatchWriteConfig): Promise<DocumentWriteResult[] | undefined>;
}

interface MTCollection {
    find: (find?: DocumentFind) => ({
        get: (config?: GetConfig) => Promise<DocumentResult[]>;
        listen: (callback: (snapshot?: DocumentResult[]) => void, onError?: (error?: DocumentError) => void, config?: GetConfig) => void;
        count: () => Promise<number>;
        limit: (limit: number) => ({
            random: (config?: GetConfig) => Promise<DocumentResult[]>;
            get: (config?: GetConfig) => Promise<DocumentResult[]>;
            listen: (callback: (snapshot?: DocumentResult[]) => void, onError?: (error?: DocumentError) => void, config?: GetConfig) => void;
            sort: (sort: Sort | string, direction?: SortDirection) => ({
                get: (config?: GetConfig) => Promise<DocumentResult[]>;
                listen: (callback: (snapshot?: DocumentResult[]) => void, onError?: (error?: DocumentError) => void, config?: GetConfig) => void;
            })
        });
        sort: (sort: Sort | string, direction?: SortDirection) => ({
            get: (config?: GetConfig) => Promise<DocumentResult[]>;
            listen: (callback: (snapshot?: DocumentResult[]) => void, onError?: (error?: DocumentError) => void, config?: GetConfig) => void;
            limit: (limit: number) => ({
                get: (config?: GetConfig) => Promise<DocumentResult[]>;
                listen: (callback: (snapshot?: DocumentResult[]) => void, onError?: (error?: DocumentError) => void, config?: GetConfig) => void;
            })
        })
    });
    sort: (sort: Sort | string, direction?: SortDirection) => ({
        get: (config?: GetConfig) => Promise<DocumentResult[]>;
        listen: (callback: (snapshot?: DocumentResult[]) => void, onError?: (error?: DocumentError) => void, config?: GetConfig) => void;
        limit: (limit: number) => ({
            get: (config?: GetConfig) => Promise<DocumentResult[]>;
            listen: (callback: (snapshot?: DocumentResult[]) => void, onError?: (error?: DocumentError) => void, config?: GetConfig) => void;
        })
    });
    limit: (limit: number) => ({
        random: (config?: GetConfig) => Promise<DocumentResult[]>;
        get: (config?: GetConfig) => Promise<DocumentResult[]>;
        listen: (callback: (snapshot?: DocumentResult[]) => void, onError?: (error?: DocumentError) => void, config?: GetConfig) => void;
        sort: (sort: Sort | string, direction?: SortDirection) => ({
            get: (config?: GetConfig) => Promise<DocumentResult[]>;
            listen: (callback: (snapshot?: DocumentResult[]) => void, onError?: (error?: DocumentError) => void, config?: GetConfig) => void;
        })
    });
    count: () => Promise<number>;
    get: (config?: GetConfig) => Promise<DocumentResult[]>;
    listen: (callback: (snapshot?: DocumentResult[]) => void, onError?: (error?: DocumentError) => void, config?: GetConfig) => void;
    findOne: (findOne?: DocumentFind) => ({
        get: (config?: GetConfig) => Promise<DocumentResult>;
        listen: (callback: (snapshot?: DocumentResult) => void, onError?: (error?: DocumentError) => void, config?: GetConfig) => void;
    });

    setOne: (value: DocumentWriteValue, config?: WriteConfig) => Promise<DocumentWriteResult>;

    setMany: (value: DocumentWriteValue[], config?: WriteConfig) => Promise<DocumentWriteResult>;

    updateOne: (find: DocumentFind, value: DocumentWriteValue, config?: WriteConfig) => Promise<DocumentWriteResult>;

    updateMany: (find: DocumentFind, value: DocumentWriteValue, config?: WriteConfig) => Promise<DocumentWriteResult>;

    mergeOne: (find: DocumentFind, value: DocumentWriteValue, config?: WriteConfig) => Promise<DocumentWriteResult>;

    mergeMany: (find: DocumentFind, value: DocumentWriteValue, config?: WriteConfig) => Promise<DocumentWriteResult>;

    replaceOne: (find: DocumentFind, value: DocumentWriteValue, config?: WriteConfig) => Promise<DocumentWriteResult>;

    putOne: (find: DocumentFind, value: DocumentWriteValue, config?: WriteConfig) => Promise<DocumentWriteResult>;

    deleteOne: (find?: DocumentFind, config?: WriteConfig) => Promise<DocumentWriteResult>;

    deleteMany: (find?: DocumentFind, config?: WriteConfig) => Promise<DocumentWriteResult>;
}

interface CollectionTaskIO<T> {
    batchWrite(map: BatchWriteValue[], config?: BatchWriteConfig): T;
}

interface StartStop {
    start: () => () => void;
}

interface OnConnectChain extends StartStop {
    onDisconnect: () => CollectionTaskIO<StartStop>;
}

interface CollectionIO extends CollectionTaskIO<OnConnectChain> {
    onDisconnect: () => CollectionTaskIO<StartStop>;
}

interface DocumentResult extends Document {
    _foreign_doc?: Document | Document[] | Document[][]
}

interface DocumentError extends ErrorResponse {

}

interface FetchHttpConfig {
    retrieval?: GetConfig['retrieval'];
    disableAuth?: boolean;
    enableMinimizer?: boolean;
    rawApproach?: boolean;
}

type Delievery = 'default' | 'no-cache' | 'no-await' | 'no-await-no-cache' | 'await-no-cache' | 'cache-no-await';

interface WriteConfig {
    /**
     * send authentication token along with this request
     */
    disableAuth?: boolean;

    /**
     * This property defines how the write will be committed and sent
     * 
     * - default: 
     * - no-cache: 
     * - no-await: 
     * - no-await-no-cache: 
     * - await-no-cache: 
     * - cache-no-await: 
     */
    delivery?: Delievery;
}

type Retrieval = 'sticky' | 'sticky-no-await' | 'sticky-reload' | 'default' | 'cache-no-await' | 'no-cache-no-await' | 'no-cache-await';

interface GetConfig {
    excludeFields?: string | string[];
    returnOnly?: string | string[];
    extraction?: GetConfigExtraction | GetConfigExtraction[];
    /**
     * This property determines how requested data is being access and handled
     * 
     * - default: will try getting fresh data from server if server is reachable, else we check if local data exists and return it, if no local data exist we await for client->server connectivity, then try getting the data, return it and cache it for future need. ⚠️ This respect disableCache value
     * 
     * - sticky: if local data exists for the specified query, such data is returned and no-ops afterwards. If no local data is found, we await for client->server connectivity and try to get fresh data from serve, return the data and cache it for future need. ⚠️ This does not respect disableCache value
     * 
     * - sticky-no-await: if local data exists for the specified query, such data is returned and no-ops afterwards. If no local data is found, will try to get fresh data from serve, we throw an error if server is not reachable else if server returns requested data, we return such data and cache it for future need. ⚠️ This does not respect disableCache value
     * 
     * - sticky-reload: if local data exists for the specified query, such data is returned, then will try getting fresh data from the server and caching it for future need. If no local data is found, we await for client->server connectivity and try to get fresh data from serve, return the data and cache it for future need
     * 
     * - cache-no-await: will try getting fresh data from server if server is reachable, else we check if local data exists and return it, if no local data exist we throw an error
     * 
     * - no-cache-no-await: will try getting fresh data from server if server is reachable, else we throw an error
     * 
     * - no-cache-await: will try getting fresh data from server when server is reachable and the result won't be cache
     * 
     * To learn and see more examples on this, Please visit https://brainbehindx.com/mosquito-transport/docs/reading_data/retrieval
     */
    retrieval?: Retrieval;
    /**
     * - 0: returns data that may have been internally updated locally with updateOne, updateMany, mergeOne, deleteOne, deleteMany, putOne, replaceOne
     * - 1: returns exact data which was cached in the last query process
     * 
     * @defaults - 0
     * 
     * To learn and see more examples on this, Please visit https://brainbehindx.com/mosquito-transport/docs/reading_data/retrieval
     */
    episode?: 0 | 1;
    /**
     * disable sending authentication token along with this request
     * 
     * @default - false
     */
    disableAuth?: boolean;
    /**
     * this reduces redundant network calls for the same query operation to a single request call.
     * 
     * @example
     * 
     * ```js
     * 
     * const mserver = new MosquitoTransport({ projectUrl: 'http://..' });
     * 
     * // operation will be reduced to only one request
     * 
     * for (let i = 0; i < 1000; i++) {
     *     mserver.collection('user').findOne({ company: 'brainbehindx' }).get({ disableMinimizer: false });
     * }
     * 
     * // operation will not be reduced and therefore 1000 network calls will be made
     * 
     * for (let i = 0; i < 1000; i++) {
     *     mserver.collection('user').findOne({ company: 'brainbehindx' }).get({ disableMinimizer: true });
     * }
     * ```
     * defaults to false
     * 
     * To learn and see more examples on this, Please visit https://brainbehindx.com/mosquito-transport/docs/reading_data/retrieval
     */
    disableMinimizer?: boolean;
}

interface GetConfigExtraction {
    limit?: number;
    sort: string;
    direction?: 'desc' | 'asc' | 1 | -1
    collection: string;
    find?: DocumentFind | DynamicValueExtraction<{ $dynamicValue: string }>;
    findOne?: DocumentFind | DynamicValueExtraction<{ $dynamicValue: string }>;
    returnOnly: string | string[]
}

interface DynamicValueExtraction<T> {
    [key: string]: T
}

interface DocumentFind {
    $and?: any[];
    $nor?: any[];
    $or?: any[];
    $text?: {
        $search: string;
        $field: string;
        $language?: string;
        $caseSensitive?: boolean;
        $diacriticSensitive?: boolean;
    };
    // $where?: string | ((this: TSchema) => boolean);
    $comment?: string | Document;
}

declare interface Document {
    _id: any;
    [key: string]: any;
}

interface DocumentWriteResult { }

interface DocumentWriteValue {

}

interface MTAuth {
    customSignin: (email: string, password: string) => Promise<SigninResult>;
    customSignup: (email: string, password: string, name?: string, metadata?: Object) => Promise<SigninResult>;
    googleSignin: (token: string) => Promise<SignupResult>;
    appleSignin: () => Promise<SignupResult>;
    facebookSignin: () => Promise<SignupResult>;
    twitterSignin: () => Promise<SignupResult>;
    githubSignin: () => Promise<SignupResult>;
    listenVerifiedStatus: (callback?: (verified?: boolean) => void, onError?: (error?: ErrorResponse) => void) => () => void;
    listenAuthToken: (callback: (token: string | null) => void) => () => void;
    getAuthToken: () => Promise<string | null>;
    getRefreshToken: () => Promise<string | undefined>;
    getRefreshTokenData: () => Promise<RefreshTokenData | undefined>;
    parseToken: (token: string) => AuthData | RefreshTokenData;
    listenAuth: (callback: (auth: TokenEventData | null) => void) => () => void;
    getAuth: () => Promise<TokenEventData>;
    signOut: () => Promise<void>;
    forceRefreshToken: () => Promise<string>;
    emulate: (projectUrl?: string) => Promise<void>;
}

interface SigninResult {
    user: AuthData;
    token: string;
    refreshToken: string;
}

interface SignupResult extends SigninResult {
    isNewUser: boolean;
}

interface AuthData {
    email?: string;
    metadata: Object;
    signupMethod: auth_provider_id_values;
    currentAuthMethod: auth_provider_id_values;
    joinedOn: number;
    uid: string;
    claims: Object;
    emailVerified: boolean;
    tokenID: string;
    disabled: boolean;
    entityOf: string;
    profile: {
        photo: string;
        name: string;
    },
    exp: number;
    aud: string;
    iss: string;
    sub: string;
}

interface RefreshTokenData {
    uid: string;
    tokenID: string;
    isRefreshToken: true;
    exp: number;
    aud: string;
    iss: string;
    sub: string;
}

interface TokenEventData extends AuthData {
    tokenManager: TokenManager;
}

interface TokenManager {
    refreshToken: string;
    accessToken: string;
}

declare type Base64String = string;

interface UploadOptions {
    /**
     * optionally create hash for this upload to save disk space
     */
    createHash?: boolean;
    /**
     * wait for a reachable server before initiating the upload task
     */
    awaitServer?: boolean;
}

interface DownloadOptions {
    /**
     * wait for a reachable server before initiating the download task
     */
    awaitServer?: boolean;
}

interface MTStorage {
    downloadFile: (link: string, onComplete?: (error?: ErrorResponse, filepath?: string) => void, destination?: string, onProgress?: (stats: DownloadProgressStats) => void, options?: DownloadOptions) => () => void;
    uploadFile: (file: Base64String | Blob | File | Buffer, destination: string, onComplete?: (error?: ErrorResponse, downloadUrl?: string) => void, onProgress?: (stats: UploadProgressStats) => void, options?: UploadOptions) => () => void;
    deleteFile: (path: string) => Promise<void>;
    deleteFolder: (folder: string) => Promise<void>;
}

interface DownloadProgressStats {
    receivedBtyes: number;
    expectedBytes: number;
    isPaused: boolean;
    pause: () => void;
    resume: () => void;
}

interface UploadProgressStats {
    sentBtyes: number;
    totalBytes: number;
}

interface ErrorResponse {
    error: string;
    message: string;
}

/** @public */
declare type Sort = string | Exclude<SortDirection, {
    $meta: string;
}> | string[] | {
    [key: string]: SortDirection;
} | Map<string, SortDirection> | [string, SortDirection][] | [string, SortDirection];

/** @public */
declare type SortDirection = 1 | -1 | 'asc' | 'desc' | 'ascending' | 'descending' | {
    $meta: string;
};