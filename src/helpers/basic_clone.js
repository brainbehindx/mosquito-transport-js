import { Buffer } from "buffer";
import { Validator } from "guard-object";

const ErrorInstances = [
    niceReturn(() => ReferenceError),
    niceReturn(() => SyntaxError),
    niceReturn(() => RangeError),
    niceReturn(() => TypeError),
    niceReturn(() => EvalError),
    Error
].filter(v => v);

/**
 * @template T
 * @param {T} obj 
 * @returns {T}
 */
export function basicClone(obj) {
    if ([NaN, undefined, Infinity, null].includes(obj)) {
        return obj;
    }

    if (typeof obj === 'bigint')
        return BigInt(obj);

    if (
        ['number', 'string', 'boolean', 'function'].includes(typeof obj) ||
        obj instanceof Promise
    ) return obj;

    for (const e of [Date, RegExp]) {
        if (isDirectInstance(obj, e))
            return new e(obj);
    }

    if (isDirectInstance(obj, ArrayBuffer))
        return obj.slice(0);

    if (
        typeof SharedArrayBuffer !== 'undefined' &&
        isDirectInstance(obj, SharedArrayBuffer)
    ) return obj.slice(0);

    if (Buffer.isBuffer(obj)) return Buffer.from(obj);

    for (const instance of ErrorInstances) {
        if (isDirectInstance(obj, instance)) {
            const n = new instance(obj.message);
            n.stack = obj.stack;
            // n.name = obj.name;
            return n;
        }
    }

    for (const e of [Map, Set]) {
        if (isDirectInstance(obj, e))
            return new e([...obj].map(basicClone));
    }

    for (
        const e of
        [
            Int8Array,
            Uint8Array,
            Uint8ClampedArray,
            Int16Array,
            Uint16Array,
            Int32Array,
            Uint32Array,
            Float32Array,
            Float64Array,
            BigInt64Array,
            BigUint64Array
        ]
    ) {
        if (isDirectInstance(obj, e))
            return new e(Buffer.from(obj));
    }

    if (
        typeof Response !== 'undefined' &&
        isDirectInstance(obj, Response)
    ) return obj.clone();

    if (
        typeof Headers !== 'undefined' &&
        isDirectInstance(obj, Headers)
    ) return new Headers(obj);

    if (
        typeof Blob !== 'undefined' &&
        isDirectInstance(obj, Blob)
    ) return obj.slice(0, obj.size, obj.type);

    if (Validator.ARRAY(obj))
        return [...obj.map(basicClone)];

    if (Validator.OBJECT(obj)) {
        const newObj = {};

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                newObj[key] = basicClone(obj[key]);
            }
        }

        return newObj;
    }

    if (ArrayBuffer.isView(obj)) return Buffer.from(obj);

    if (obj instanceof Error) {
        // general errors
        try {
            const n = new obj.constructor(obj.message);
            n.stack = obj.stack;
            return n;
        } catch (error) {
            const n = new Error(obj.message);
            n.stack = obj.stack;
            try {
                n.name = obj.name;
            } catch (_) { }
            return n;
        }
    }

    throw `${obj} cannot be cloned`;
}

/**
 * @template T
 * @param {unknown} obj
 * @param {new (...args: any[]) => T} Class
 * @returns {obj is T}
 */
function isDirectInstance(obj, Class) {
    return typeof obj === "object" && obj !== null && obj.constructor === Class;
}

function niceReturn(func) {
    try {
        return func();
    } catch (_) { }
}