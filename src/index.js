import 'react-native-get-random-values';
import { deserializeE2E, listenReachableServer, serializeE2E } from "./helpers/peripherals";
import { awaitStore, releaseCacheStore } from "./helpers/utils";
import { Scoped } from "./helpers/variables";
import { MTAuth } from "./products/auth";
import { MTCollection, batchWrite, trySendPendingWrite } from "./products/database";
import { MTStorage } from "./products/storage";
import { ServerReachableListener, TokenRefreshListener } from "./helpers/listeners";
import { initTokenRefresher, listenToken, listenTokenReady, triggerAuthToken } from "./products/auth/accessor";
import { TIMESTAMP, DOCUMENT_EXTRACTION, FIND_GEO_JSON, GEO_JSON } from "./products/database/types";
import { mfetch } from "./products/http_callable";
import { io } from "socket.io-client";
import { AUTH_PROVIDER_ID, CACHE_PROTOCOL } from "./helpers/values";
import EngineApi from './helpers/engine_api';
import { parse, stringify } from 'json-buffer';
import { Validator } from 'guard-object';
import cloneDeep from 'lodash.clonedeep';

const {
    _listenCollection,
    _listenDocument,
    _startDisconnectWriteTask,
    _cancelDisconnectWriteTask,
    _listenUserVerification
} = EngineApi;

// https://socket.io/docs/v3/emit-cheatsheet/#reserved-events
const reservedEventName = [
    'connect',
    'connect_error',
    'disconnect',
    'disconnecting',
    'newListener',
    'removeListener'
];

class RNMT {
    constructor(config) {
        validateMTConfig(config, this);
        this.config = {
            ...config,
            castBSON: config.castBSON === undefined || config.castBSON,
            maxRetries: config.maxRetries || 3,
            uglify: config.enableE2E_Encryption
        };
        const { projectUrl } = this.config;

        this.config.secureUrl = projectUrl.startsWith('https');
        this.config.baseUrl = projectUrl.split('://')[1];
        this.config.wsPrefix = this.config.secureUrl ? 'wss' : 'ws';

        if (!Scoped.ReleaseCacheData)
            throw `releaseCache must be called before creating any ${this.constructor.name} instance`;

        if (!Scoped.InitializedProject[projectUrl]) {
            Scoped.InitializedProject[projectUrl] = cloneDeep(this.config);
            Scoped.LastTokenRefreshRef[projectUrl] = 0;
            triggerAuthToken(projectUrl);
            initTokenRefresher({ ...this.config }, true);

            let isConnected,
                lastSentToken,
                queuedToken;

            const socket = io(`${this.config.wsPrefix}://${this.config.baseUrl}`, {
                transports: ['websocket', 'polling', 'flashsocket'],
                auth: {
                    _m_internal: true,
                    _from_base: true
                }
            });

            socket.on('_signal_signout', () => {
                this.auth().signOut();
            });

            socket.on('connect', () => {
                isConnected = true;
                Scoped.IS_CONNECTED[projectUrl] = true;
                if (queuedToken) updateMountedToken(queuedToken.token);
                ServerReachableListener.dispatch(projectUrl, true);
                awaitStore().then(() => {
                    trySendPendingWrite(projectUrl);
                });
            });

            socket.on('disconnect', () => {
                isConnected = false;
                Scoped.IS_CONNECTED[projectUrl] = false;
                ServerReachableListener.dispatch(projectUrl, false);
            });

            const updateMountedToken = (token) => {
                if ((lastSentToken || null) !== (token || null)) {
                    socket.emit('_update_mounted_user', token || null);
                    lastSentToken = token;
                }
                queuedToken = undefined;
            };

            listenToken(token => {
                if (isConnected) {
                    updateMountedToken(token);
                } else queuedToken = { token };
            }, projectUrl);

            TokenRefreshListener.listenTo(projectUrl, v => {
                Scoped.IS_TOKEN_READY[projectUrl] = v;
            });
        }
    }

    static releaseCache(prop) {
        if (Scoped.ReleaseCacheData) throw `calling ${this.name}() multiple times is prohibited`;
        validateReleaseCacheProp({ ...prop });
        Scoped.ReleaseCacheData = { ...prop };
        releaseCacheStore({ ...prop });
    }

    getDatabase = (dbName, dbUrl) => ({
        collection: (path) => new MTCollection({
            ...this.config,
            path,
            ...dbName ? { dbName } : {},
            ...dbUrl ? { dbUrl } : {}
        })
    });

    collection = (path) => new MTCollection({ ...this.config, path });
    batchWrite = (map, configx) => batchWrite({ ...this.config }, map, configx);
    auth = () => new MTAuth({ ...this.config });
    storage = () => new MTStorage({ ...this.config });
    fetchHttp = (endpoint, init, config) => mfetch(endpoint, init, { ...this.config, method: config });
    listenReachableServer = (callback) => listenReachableServer(callback, this.config.projectUrl);

    getSocket = (configOpts) => {
        const { disableAuth, authHandshake } = configOpts || {};
        const { projectUrl, uglify, accessKey, serverE2E_PublicKey, wsPrefix } = this.config;

        const restrictedRoute = [
            _listenCollection,
            _listenDocument,
            _startDisconnectWriteTask,
            _cancelDisconnectWriteTask,
            _listenUserVerification
        ].map(v => [v(), v(true)]).flat();

        const makeSocketCallback = () =>
            new Promise(resolve => {
                socketReadyCallback = resolve;
            });

        let socketReadyCallback,
            socketReadyPromise = makeSocketCallback(),
            socketListenerList = [],
            socketListenerIte = 0;

        let hasCancelled,
            socket,
            tokenListener,
            clientPrivateKey;

        const listenerCallback = (route, callback) => function () {
            if (reservedEventName.includes(route)) {
                callback?.(...[...arguments]);
                return;
            }

            const [args, emitable] = [...arguments];
            let res;

            if (uglify) {
                res = parse(deserializeE2E(args, serverE2E_PublicKey, clientPrivateKey));
            } else res = args;

            callback?.(...res || [], ...typeof emitable === 'function' ? [function () {
                const args = [...arguments];
                let res;

                if (uglify) {
                    res = serializeE2E(stringify(args), undefined, serverE2E_PublicKey)[0];
                } else res = args;

                emitable(res);
            }] : []);
        };

        const emit = ({ timeout, promise, emittion: emittionx }) => new Promise(async (resolve, reject) => {
            const [route, ...emittion] = emittionx;

            if (typeof route !== 'string')
                throw `expected ${promise ? 'emitWithAck' : 'emit'} first argument to be a string type`;

            if (restrictedRoute.includes(route))
                throw `${route} is a restricted socket path, avoid using any of ${restrictedRoute}`;

            let hasResolved, stime = Date.now();

            const timer = timeout ? setTimeout(() => {
                hasResolved = true;
                reject(new Error('emittion timeout'));
            }, timeout) : undefined;

            await socketReadyPromise;
            if (hasResolved) return;
            clearTimeout(timer);

            try {
                const thisSocket = timeout ? socket.timeout(Math.max(timeout - (Date.now() - stime), 0)) : socket;

                const lastEmit = emittion.slice(-1)[0];
                const hasEmitable = typeof lastEmit === 'function';
                const mit = hasEmitable ? emittion.slice(0, -1) : emittion;

                const [reqBuilder, [privateKey]] = uglify ? serializeE2E(stringify(mit), undefined, serverE2E_PublicKey) : [undefined, []];

                if (hasEmitable && promise)
                    throw 'emitWithAck cannot have function in it argument';

                const result = await thisSocket[promise ? 'emitWithAck' : 'emit'](route,
                    uglify ? reqBuilder : mit,
                    ...hasEmitable ? [function () {
                        const [args] = [...arguments];
                        let res;

                        if (uglify) {
                            res = parse(deserializeE2E(args, serverE2E_PublicKey, privateKey));
                        } else res = args;

                        lastEmit(...res || []);
                    }] : []
                );

                resolve((promise && result) ? uglify ? parse(deserializeE2E(result, serverE2E_PublicKey, privateKey))[0] : result[0] : undefined);
            } catch (e) {
                reject(e);
            }
        });

        const init = async () => {
            if (hasCancelled) return;
            const mtoken = disableAuth ? undefined : Scoped.AuthJWTToken[projectUrl];
            const [reqBuilder, [privateKey]] = uglify ? serializeE2E({ accessKey, a_extras: authHandshake }, mtoken, serverE2E_PublicKey) : [null, []];

            socket = io(`${wsPrefix}://${projectUrl.split('://')[1]}`, {
                transports: ['websocket', 'polling', 'flashsocket'],
                auth: uglify ? {
                    ugly: true,
                    e2e: reqBuilder
                } : {
                    ...mtoken ? { mtoken } : {},
                    a_extras: authHandshake,
                    accessKey
                }
            });
            clientPrivateKey = privateKey;

            socketReadyCallback();
            socketListenerList.forEach(([_, method, route, callback]) => {
                socket[method](route, callback);
            });
        }

        if (disableAuth) {
            init();
        } else {
            let lastTokenStatus;

            tokenListener = listenTokenReady(status => {
                if (lastTokenStatus === (status || false)) return;

                if (status === 'ready') {
                    init();
                } else {
                    socket?.close?.();
                    socket = undefined;
                    socketReadyPromise = makeSocketCallback();
                }
                lastTokenStatus = status || false;
            }, projectUrl);
        }

        return {
            timeout: (timeout) => {
                if (timeout !== undefined && !Validator.POSITIVE_INTEGER(timeout))
                    throw `expected a positive integer for timeout but got ${timeout}`;

                return {
                    emitWithAck: function () {
                        return emit({
                            timeout,
                            promise: true,
                            emittion: [...arguments]
                        });
                    }
                };
            },
            emit: function () { emit({ emittion: [...arguments] }) },
            emitWithAck: function () {
                return emit({
                    emittion: [...arguments],
                    promise: true
                });
            },
            on: async (route, callback) => {
                if (restrictedRoute.includes(route))
                    throw `${route} is a restricted socket path, avoid using any of ${restrictedRoute}`;
                const ref = ++socketListenerIte,
                    listener = listenerCallback(route, callback);

                socketListenerList.push([ref, 'on', route, listener]);
                if (socket) socket.on(route, listener);

                return () => {
                    if (socket) socket.off(route, listener);
                    socketListenerList = socketListenerList.filter(([id]) => id !== ref);
                }
            },
            once: async (route, callback) => {
                if (restrictedRoute.includes(route))
                    throw `${route} is a restricted socket path, avoid using any of ${restrictedRoute}`;
                const ref = ++socketListenerIte,
                    listener = listenerCallback(route, callback);

                socketListenerList.push([ref, 'once', route, listener]);
                if (socket) socket.once(route, listener);

                return () => {
                    if (socket) socket.off(route, listener);
                    socketListenerList = socketListenerList.filter(([id]) => id !== ref);
                }
            },
            destroy: () => {
                hasCancelled = true;
                tokenListener?.();
                if (socket) socket.close();
                socketListenerList = [];
            }
        }
    }
};

const validateReleaseCacheProp = (prop) => {
    const cacheList = [...Object.values(CACHE_PROTOCOL)];

    Object.entries(prop).forEach(([k, v]) => {
        if (k === 'cachePassword') {
            if (typeof v !== 'string' || v.trim().length <= 0)
                throw `Invalid value supplied to cachePassword, value must be a string and greater than 0 characters`;
        } else if (k === 'cacheProtocol') {
            if (!cacheList.includes(`${v}`)) throw `unknown value supplied to ${k}, expected any of ${cacheList}`;
        } else if (k === 'io') {
            Object.entries(v).forEach(([k, v]) => {
                if (k === 'input' || k === 'output') {
                    if (typeof v !== 'function')
                        throw `Invalid value supplied to "io.${k}", expected a function but got "${v}"`;
                } else throw `Unexpected property named "io.${k}"`;
            });
        } else if (k === 'promoteCache') {
            if (typeof v !== 'boolean') throw 'promoteCache should be a boolean';
        } else if (k === 'heapMemory') {
            if (typeof v !== 'number' || v <= 0)
                throw `Invalid value supplied to heapMemory, value must be an integer greater than zero`;
        } else throw `Unexpected property named ${k}`;
    });

    if (!prop?.io && !prop?.cacheProtocol) throw 'You need to provide either "io" or "cacheProtocol"';
}

const validator = {
    dbName: (v) => {
        if (typeof v !== 'string' || !v.trim())
            throw `Invalid value supplied to dbName, value must be a non-empty string`;
    },
    dbUrl: (v) => {
        if (typeof v !== 'string' || !v.trim())
            throw `Invalid value supplied to dbUrl, value must be a non-empty string`;
    },
    projectUrl: (v) => {
        if (typeof v !== 'string' || (!Validator.HTTPS(v) && !Validator.HTTP(v)))
            throw `Expected "projectUrl" to be valid https or http link but got "${v}"`;
    },
    disableCache: (v) => {
        if (typeof v !== 'boolean')
            throw `Invalid value supplied to disableCache, value must be a boolean`;
    },
    accessKey: (v) => {
        if (typeof v !== 'string' || !v.trim())
            throw `Invalid value supplied to accessKey, value must be a non-empty string`;
    },
    maxRetries: (v) => {
        if (v <= 0 || !Validator.POSITIVE_INTEGER(v))
            throw `Invalid value supplied to maxRetries, value must be positive integer greater than zero`;
    },
    enableE2E_Encryption: (v) => {
        if (typeof v !== 'boolean')
            throw `Invalid value supplied to enableE2E_Encryption, value must be a boolean`;
    },
    castBSON: v => {
        if (typeof v !== 'boolean')
            throw `Invalid value supplied to castBSON, value must be a boolean`;
    },
    borrowToken: v => {
        if (typeof v !== 'string' || (!Validator.HTTPS(v) && !Validator.HTTP(v)))
            throw `Expected "borrowToken" to be valid https or http link but got "${v}"`;
    },
    serverE2E_PublicKey: (v) => {
        if (typeof v !== 'string' || !v.trim())
            throw `Invalid value supplied to serverETE_PublicKey, value must be a non-empty string`;
    }
};

const validateMTConfig = (config, that) => {
    if (!Validator.OBJECT(config))
        throw `${that.constructor.name} config is not an object`;

    for (const [k, v] of Object.entries(config)) {
        if (!validator[k]) throw `Unexpected property named ${k}`;
        validator[k](v);
    }

    if (config.enableE2E_Encryption && !config.serverE2E_PublicKey)
        throw '"serverE2E_PublicKey" is missing, enabling end-to-end encryption requires a public encryption key from the server';
    if (!config.projectUrl) throw `projectUrl is a required property in ${that.constructor.name}() constructor`;
    if (!config.accessKey) throw `accessKey is a required property in ${that.constructor.name}() constructor`;
}

export {
    TIMESTAMP,
    DOCUMENT_EXTRACTION,
    FIND_GEO_JSON,
    GEO_JSON,
    AUTH_PROVIDER_ID
};

export default RNMT;