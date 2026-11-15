import LimitTask from "limit-task";
import { PACKAGES } from "./variables";

function e2e_baseCode() {
    const serializeE2E = (data, serverPublicKey) => {
        const pair = box.keyPair(),
            nonce = randomBytes(box.nonceLength);

        return {
            data: box(data, nonce, serverPublicKey, pair.secretKey),
            pair,
            nonce
        };
    };

    const deserializeE2E = (data, nonce, serverPublicKey, clientPrivateKey) => {
        const result = box.open(
            data,
            nonce,
            serverPublicKey,
            clientPrivateKey
        );

        if (!result) throw 'Decrypting e2e message failed';
        return result;
    };

    self.onmessage = function (event) {
        const { data } = event;

        try {
            let response;
            if (data.type === 'encrypt') {
                response = serializeE2E(...data.params);
            } else if (data.type === 'decrypt') {
                response = deserializeE2E(...data.params);
            }
            self.postMessage([response, data.session]);
        } catch (error) {
            self.postMessage([undefined, undefined, { error }]);
        }
    };
}

let workerCode;

const spawnWorker = () => {
    if (!workerCode) {
        workerCode = `
   const NACL_PKG = ${PACKAGES.tweetnacl.NACL.toString()};
   const naclPkg = {};

   NACL_PKG(naclPkg);

   const { box, randomBytes } = naclPkg;

   const baseCode = ${e2e_baseCode.toString()};
   baseCode();
`;
    }

    const resolution = {};
    let ite = 0;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    // Receive the result from the worker
    worker.onmessage = function (event) {
        const [response, session, error] = event.data;
        if (error) {
            resolution[session][1](error.error);
        } else {
            resolution[session][0](response);
        }
        delete resolution[session];
    };

    let closureError;
    const rejectPendingTasks = () => {
        const pendTasks = Object.entries(resolution);
        for (const [session, [_, reject]] of pendTasks) {
            delete resolution[session];
            reject(closureError?.error);
        }

        if (pendTasks.length) setTimeout(rejectPendingTasks, 90);

        for (let i = 0; i < e2e_engines.length; i++) {
            const thatCallback = e2e_engines[i];

            if (thatCallback === callback) {
                e2e_engines.splice(i, 1);
                currentTask = 0;
                break;
            }
        }
    };

    worker.onerror = err => {
        closureError = { error: err };
        rejectPendingTasks(err);
    }

    const queue = LimitTask(3);

    const callback = (type, params) =>
        queue(() =>
            new Promise((resolve, reject) => {
                const session = `${++ite}`;

                resolution[session] = [resolve, reject];
                worker.postMessage({ type, params, session });
            })
        );

    return callback;
};

let currentTask = -1;
const e2e_engines = [];

const MAX_WORKERS = 7;

const addTask = (type, params) => {
    ++currentTask;
    if (currentTask >= e2e_engines.length) {
        if (e2e_engines.length < MAX_WORKERS) {
            // spawn new engine
            e2e_engines.push(spawnWorker());
        } else currentTask = 0;
    }
    return e2e_engines[currentTask](type, params);
}

export default {
    encrypt: (bufferData, serverPublicKey) => {
        return addTask('encrypt', [bufferData, serverPublicKey]);
    },
    decrypt: (data, nonce, serverPublicKey, clientPrivateKey) => {
        return addTask('decrypt', [data, nonce, serverPublicKey, clientPrivateKey]);
    }
};