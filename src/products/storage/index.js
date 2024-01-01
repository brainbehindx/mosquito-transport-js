import EngineApi from "../../helpers/EngineApi";
import { Scoped } from "../../helpers/variables";
import { awaitReachableServer, buildFetchInterface, simplifyError } from "../../helpers/utils";
import { awaitRefreshToken } from "../auth/accessor";
import { Buffer } from "buffer";

export class MTStorage {
    constructor(config) {
        this.builder = { ...config };
    }

    uploadFile = (file, destination, onComplete, onProgress, reqOptions) => {
        let hasCancelled = false, hasFinished = false, xhr;

        (async () => {
            let base64, buffer;

            if (Buffer.isBuffer(file)) {
                buffer = file;
            } else if (file instanceof Blob) {
                try {
                    buffer = await file.arrayBuffer();
                } catch (e) {
                    onComplete?.({
                        error: 'invalid_blob',
                        message: `uploadFile() first argument has an invalid blob ${e}`
                    });
                    return;
                }
            } else if (typeof file === 'string' && file?.trim()) {
                base64 = file.replace(/^data:\w+\/\w+;base64,/, '');
            } else {
                onComplete?.({
                    error: 'file_path_invalid',
                    message: `uploadFile() first argument must either be a blob, buffer or base64 string`
                });
                return;
            }
            if (hasCancelled) return;
            destination = destination?.trim();

            const destErr = validateDestination(destination);

            if (destErr) {
                onComplete?.({ error: 'destination_invalid', message: destErr });
                return;
            }

            const { projectUrl, accessKey } = this.builder;
            xhr = new XMLHttpRequest();
            const { awaitServer } = reqOptions || {};

            if (awaitServer) await awaitReachableServer(projectUrl);
            await awaitRefreshToken(projectUrl);

            xhr.open('POST', EngineApi._uploadFile(projectUrl), true);
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
            xhr.setRequestHeader('Authorization', `Bearer ${btoa(accessKey)}`);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Content-Type', buffer ? 'buffer/upload' : 'text/plain');
            if (Scoped.AuthJWTToken[projectUrl]) xhr.setRequestHeader('Mosquito-Token', Scoped.AuthJWTToken[projectUrl]);
            xhr.setRequestHeader('Mosquito-Destination', destination);
            if (base64) xhr.setRequestHeader('Mosquito-Encoding', 'base64');
            xhr.send(base64 || buffer);
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
    const { projectUrl, accessKey } = builder;

    try {
        const r = await (await fetch(
            EngineApi[isFolder ? '_deleteFolder' : '_deleteFile'](projectUrl),
            buildFetchInterface({ path }, accessKey, Scoped.AuthJWTToken[projectUrl], 'DELETE')
        )).json();
        if (r.simpleError) throw r;
        if (r.status !== 'success') throw 'operation not successful';
    } catch (e) {
        if (e?.simpleError) throw e.simpleError;
        throw simplifyError('unexpected_error', `${e}`).simpleError;
    }
}

const validateDestination = (t = '') => {
    t = t.trim();

    if (!t || typeof t !== 'string') return `destination is required`;
    if (t.startsWith('/') || t.endsWith('/')) return 'destination must neither start with "/" nor end with "/"';
    let l = '', r;

    t.split('').forEach(e => {
        if (e === '/' && l === '/') r = 'invalid destination path, "/" cannot be side by side';
        l = e;
    });

    return r;
};