import { Buffer } from "buffer";

function randomBytes(size) {
    const bytes = new Uint8Array(size);

    try {
        return crypto.getRandomValues(bytes);
    } catch (error) {
        for (let i = 0; i < size; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }

        return bytes;
    }
}

const PROCESS_UNIQUE = randomBytes(5);
let counter = randomBytes(3).readUIntBE(0, 3);

export function currentObjectId() {
    const timestamp = Buffer.allocUnsafe(4);
    timestamp.writeUInt32BE(Math.floor(Date.now() / 1000));

    counter = (counter + 1) & 0xffffff;

    const increment = Buffer.allocUnsafe(3);
    increment.writeUIntBE(counter, 0, 3);

    return {
        $oid: Buffer.concat([
            timestamp,
            PROCESS_UNIQUE,
            increment
        ]).toString('hex')
    };
};