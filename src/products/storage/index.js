import EngineApi from "../../helpers/engine_api";
import { encodeBinary } from "../../helpers/peripherals";
import { Scoped } from "../../helpers/variables";
import { awaitReachableServer, buildFetchInterface } from "../../helpers/utils";
import { awaitRefreshToken } from "../auth/accessor";
import { Buffer } from "buffer";
import { simplifyError } from "simplify-error";

export class MTStorage {
    constructor(config) {
        this.builder = { ...config };
    }

    uploadFile = (file, destination, onComplete, onProgress, reqOptions) => {
        let hasCancelled = false,
            hasFinished = false,
            xhr;

        (async () => {
            let fileStream, buffer;

            if (Buffer.isBuffer(file)) {
                buffer = file;
            } else if ((file instanceof File) || (file instanceof Blob)) {
                fileStream = file;
            } else if (typeof file === 'string' && file.trim()) {
                buffer = Buffer.from(file.replace(/^data:\w+\/\w+;base64,/, ''), 'base64');
            } else {
                onComplete?.({
                    error: 'file_path_invalid',
                    message: `uploadFile() first argument must either be a blob, buffer or base64 string`
                });
                return;
            }
            if (hasCancelled) return;
            destination = destination?.trim?.();

            try {
                validateDestination(destination);
            } catch (error) {
                onComplete?.({ error: 'destination_invalid', message: error });
                return () => { };
            }

            const { projectUrl, accessKey, uglify } = this.builder;
            xhr = new XMLHttpRequest();
            const { awaitServer, createHash } = reqOptions || {};

            if (awaitServer) await awaitReachableServer(projectUrl);
            await awaitRefreshToken(projectUrl);

            xhr.open('POST', EngineApi._uploadFile(projectUrl, uglify), true);
            xhr.upload.addEventListener('progress', e => {
                onProgress?.({ sentBtyes: e.loaded, totalBytes: e.total });
            });
            xhr.addEventListener('load', () => {
                if (hasFinished || hasCancelled) return;
                hasFinished = true;
                try {
                    const result = JSON.parse(xhr.responseText);
                    if (result.status === 'success' && result.downloadUrl) {
                        onComplete?.(undefined, result.downloadUrl);
                    } else throw (result.simpleError || { error: 'unexpected_error', message: `An unexpected error occurred` });
                } catch (e) {
                    onComplete?.(e);
                }
            });
            xhr.addEventListener('error', () => {
                if (hasFinished || hasCancelled) return;
                hasFinished = true;
                onComplete?.({ error: 'unexpected_error', message: 'An unexpected error occurred' });
            });
            xhr.addEventListener('abort', () => {
                if (hasFinished || hasCancelled) return;
                hasFinished = true;
                onComplete?.({ error: 'upload_aborted', message: 'The upload process was aborted' });
            });
            xhr.setRequestHeader('Authorization', `Bearer ${encodeBinary(accessKey)}`);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Content-Type', 'buffer/upload');
            if (Scoped.AuthJWTToken[projectUrl])
                xhr.setRequestHeader('Mosquito-Token', Scoped.AuthJWTToken[projectUrl]);
            if (createHash) xhr.setRequestHeader('hash-upload', 'yes');
            xhr.setRequestHeader('Mosquito-Destination', destination);
            xhr.send(fileStream || buffer);
        })();

        return () => {
            if (hasCancelled) return;
            hasCancelled = true;
            if (xhr) xhr.abort();
            setTimeout(() => {
                onComplete?.({ error: 'upload_aborted', message: 'The upload process was aborted' });
            }, 1);
        }
    }

    deleteFile = (path) => deleteContent(this.builder, path);
    deleteFolder = (path) => deleteContent(this.builder, path, true);
}

const deleteContent = async (builder, path, isFolder) => {
    const { projectUrl, accessKey, uglify } = builder;

    try {
        const r = await (await fetch(
            EngineApi[isFolder ? '_deleteFolder' : '_deleteFile'](projectUrl, uglify),
            buildFetchInterface({ path }, accessKey, Scoped.AuthJWTToken[projectUrl], 'DELETE')
        )).json();
        if (r.simpleError) throw r;
        if (r.status !== 'success') throw 'operation not successful';
    } catch (e) {
        if (e?.simpleError) throw e.simpleError;
        throw simplifyError('unexpected_error', `${e}`).simpleError;
    }
};

const validateDestination = (t = '') => {
    if (typeof t !== 'string' || !t.trim()) throw 'path must be a non-empty string';
    if (t.startsWith(' ') || t.endsWith(' ')) throw 'path must be trimmed';
    if (t.startsWith('./') || t.startsWith('../')) throw 'path must be absolute';
    if (t.endsWith('/')) throw 'path must not end with "/"';
    if ('?'.split('').some(v => t.includes(v)))
        throw `path must not contain ?`;

    t = t.trim();
    let l = '';

    t.split('').forEach(e => {
        if (e === '/' && l === '/') throw 'invalid destination path, "/" cannot be duplicated side by side';
        l = e;
    });
};