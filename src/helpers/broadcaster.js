import { initTokenRefresher, triggerAuthToken } from "../products/auth/accessor";
import { notifyDatabaseNodeChanges, revertChanges, syncCache } from "../products/database/accessor";
import { deserializeBSON } from "../products/database/bson";
import { TokenRefreshListener } from "./listeners";
import { awaitStore } from "./utils";
import { CacheStore, Scoped } from "./variables";

const InstanceID = `${Math.random()}`;
const broadcaster = new BroadcastChannel('MOSQUITO_BROADCASTER');

broadcaster.onmessage = async (e) => {
    const { kind, context, data } = JSON.parse(e.data);
    if (context === InstanceID) return;
    await awaitStore();

    if (kind === 'auth') {
        const { projectUrl, authData } = data;
        CacheStore.AuthStore[projectUrl] = authData;
        Scoped.AuthJWTToken[projectUrl] = authData?.token;
        TokenRefreshListener.dispatch(projectUrl);
        triggerAuthToken(projectUrl);
        initTokenRefresher(Scoped.InitializedProject[projectUrl]);
    } else if (kind === 'database-sync') {
        // only if cache protocol is in-memory
        const { builder, result, writeId } = data;
        const { editions, pathChanges } = syncCache(builder, deserializeBSON(result)._);
        Scoped.broadcastedWrites[writeId] = { editions, builder };
        notifyDatabaseNodeChanges(builder, pathChanges);
    } else if (kind === 'database-revert') {
        // only if cache protocol is in-memory
        const { writeId, revert } = data;
        if (!Scoped.broadcastedWrites[writeId]) return;

        const { editions, builder } = Scoped.broadcastedWrites[writeId];
        if (revert) {
            const pathChanges = revertChanges(builder, editions);
            notifyDatabaseNodeChanges(builder, pathChanges);
        }
        delete Scoped.broadcastedWrites[writeId];
    }
};

const sendMessage = (event, data) => {
    broadcaster.postMessage(
        JSON.stringify({
            kind: event,
            context: InstanceID,
            data
        })
    );
};

export default sendMessage;