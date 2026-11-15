import { Buffer } from "buffer";
import e2e_worker from "./e2e_worker";
import { deserialize, serialize } from "entity-serializer";
import { grab } from "poke-object";
import { Scoped, PACKAGES } from "./variables";

export const prefixStoragePath = (path, prefix = 'file:///') => {
    let cleanedPath = path.replace(/^[^/]+:\/{1,3}/, '');

    // Continuously remove any remaining protocol patterns until none are left
    while (/^[^/]+:\/{1,3}/.test(cleanedPath)) {
        cleanedPath = cleanedPath.replace(/^[^/]+:\/{1,3}/, '');
    }

    // Remove any leading slashes after protocol removal
    cleanedPath = cleanedPath.replace(/^\/+/, '');

    return `${prefix}${cleanedPath}`;
};

export const normalizeRoute = (route = '') => route.split('').map((v, i, a) =>
    ((!i && v === '/') || (i === a.length - 1 && v === '/') || (i && a[i - 1] === '/' && v === '/')) ? '' : v
).join('');

export const shuffleArray = (n) => {
    const array = n.slice(0);
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }

    return array;
}

export function sortArrayByObjectKey(arr = [], key) {
    return arr.sort(function (a, b) {
        const left = grab(a, key),
            right = grab(b, key);

        return (left > right) ? 1 : (left < right) ? -1 : 0;
    });
};

export async function niceHash(str = '') {
    if (typeof str !== 'string') {
        str = (Buffer.isBuffer(str) ? str : serialize(str)).toString('base64');
    }

    try {
        // Convert the string to a Uint8Array
        const encoder = new TextEncoder();
        const data = encoder.encode(str);

        // Use the Web Crypto API to compute the hash
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);

        // Convert to base64
        return Buffer.from(new Uint8Array(hashBuffer)).toString('base64');
    } catch (_) {
        return fnv64Hash(str);
    }
};

export function fnv64Hash(str) {
    if (typeof str !== 'string') {
        str = (Buffer.isBuffer(str) ? str : serialize(str)).toString('base64');
    }

    let hi = 0xcbf29ce4 | 0;
    let lo = 0x84222325 | 0;

    for (let i = 0; i < str.length; i++) {
        lo ^= str.charCodeAt(i);

        // Multiply by FNV prime: 0x00000100000001B3
        const low = lo >>> 0;
        const high = hi >>> 0;

        const product = low * 0x1b3;

        const newLo = product >>> 0;
        const carry = Math.floor(product / 0x100000000);

        hi = (high * 0x1b3 + low * 0x100 + carry) | 0;
        lo = newLo | 0;
    }

    return (
        (hi >>> 0).toString(16).padStart(8, '0') +
        (lo >>> 0).toString(16).padStart(8, '0')
    );
};

const validateTweetNaclPkg = () => {
    if (!PACKAGES.tweetnacl)
        throw `tweetnacl has not been initialize, kindly initialize via 'initializeTweetNACL(nacl_package)'`;

    const { box, randomBytes } = PACKAGES.tweetnacl;

    if (typeof randomBytes !== 'function' || !box)
        throw `tweetnacl was initialize incorrectly, make sure you pass a valid tweetnacl package to 'initializeTweetNACL'`;
}

export const serializeE2E = async (data, auth_token, serverPublicKey) => {
    validateTweetNaclPkg();

    const inputData = serialize([data, auth_token]);

    if (inputData.byteLength > 10240) {
        // dispatch to background thread
        const { data, pair, nonce } = await e2e_worker.encrypt(inputData, serverPublicKey);

        return [
            serialize([pair.publicKey, nonce, data]),
            [pair.secretKey, pair.publicKey]
        ];
    }

    const { box, randomBytes } = PACKAGES.tweetnacl;

    const pair = box.keyPair();
    const nonce = randomBytes(box.nonceLength);

    return [
        serialize([
            pair.publicKey,
            nonce,
            Buffer.from(
                box(
                    inputData,
                    nonce,
                    serverPublicKey,
                    pair.secretKey
                )
            )
        ]),
        [pair.secretKey, pair.publicKey]
    ];
};

export const deserializeE2E = async (data, serverPublicKey, clientPrivateKey) => {
    validateTweetNaclPkg();

    const [binaryNonce, binaryData] = deserialize(data);
    let baseArray;

    if (binaryData.byteLength > 10240) {
        // dispatch to background thread
        baseArray = await e2e_worker.decrypt(binaryData, binaryNonce, serverPublicKey, clientPrivateKey);
    } else {
        const { box } = PACKAGES.tweetnacl;

        baseArray = box.open(binaryData, binaryNonce, serverPublicKey, clientPrivateKey);
    }

    if (!baseArray) throw 'Decrypting e2e message failed';
    return deserialize(baseArray);
};

export const encodeBinary = (s) => Buffer.from(s, 'utf8').toString('base64');
export const decodeBinary = (s) => Buffer.from(s, 'base64').toString('utf8');

export const parseToken = (token) => JSON.parse(decodeBinary(token.split('.')[1]));

export const isBrowserContext = () => typeof window !== 'undefined' && typeof document !== 'undefined';

export const listenScreenVisible = (callback) => {
    let lastVisibility;

    const onVisibility = (visible) => {
        if (visible === lastVisibility) return;
        lastVisibility = visible;
        callback(visible);
    }

    const onBlur = () => {
        onVisibility(false);
    }

    const onFocus = () => {
        onVisibility(true);
    }

    const onChanged = () => {
        onVisibility(document.visibilityState === 'visible');
    }

    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onChanged);

    const timer = setTimeout(onChanged, 9);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('blur', onBlur);
        window.removeEventListener('focus', onFocus);
        document.removeEventListener('visibilitychange', onChanged);
    }
};

export const isScreenFocused = () => Scoped.IS_SCREEN_FOCUSED ?? (document.visibilityState === 'visible');

if (isBrowserContext())
    listenScreenVisible(visible => {
        Scoped.IS_SCREEN_FOCUSED = visible;
    });
