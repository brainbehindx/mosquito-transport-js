import { guardObject, GuardSignal, niceGuard, Validator } from "guard-object";
import { RETRIEVAL } from "../../helpers/values";
import { grab } from "poke-object";
import { testDocument } from "./query";

const DirectionList = [1, -1, 'asc', 'desc', 'ascending', 'descending'];
const FilterFootPrint = t => {
    validateFilter(t);
    return true;
};
const ReturnAndExcludeFootprint = t => t === undefined ||
    !(Array.isArray(t) ? t : [t]).filter(v => !Validator.TRIMMED_NON_EMPTY_STRING(v)).length;

const ConfigFind = t => t && FilterFootPrint(assignExtractionFind({}, t));

const FindConfig = {
    extraction: t => t === undefined ||
        (Array.isArray(t) ? t : [t]).filter(m =>
            guardObject({
                collection: isValidCollectionName,
                sort: (t, p) => t === undefined || (Validator.TRIMMED_NON_EMPTY_STRING(t) && p.find),
                direction: (t, p) => t === undefined || (p.sort && p.find && DirectionList.includes(t)),
                limit: (t, p) => t === undefined || (Validator.POSITIVE_INTEGER(t) && p.find),
                find: (t, p) => (t === undefined && p.findOne) || (!p.findOne && ConfigFind(t)),
                findOne: (t, p) => (t === undefined && p.find) || (!p.find && ConfigFind(t)),
                returnOnly: ReturnAndExcludeFootprint,
                excludeFields: ReturnAndExcludeFootprint
            }).validate(m)
        ).length,
    returnOnly: ReturnAndExcludeFootprint,
    excludeFields: ReturnAndExcludeFootprint,
    onWaiting: t => t === undefined || typeof t === 'function',
    episode: t => [undefined, 0, 1].includes(t),
    retrieval: t => t === undefined || Object.values(RETRIEVAL).includes(t),
    disableAuth: t => t === undefined || typeof t === 'boolean',
    disableMinimizer: t => t === undefined || typeof t === 'boolean'
};

export const validateFindConfig = (config) => config === undefined ||
    guardObject(FindConfig).validate(config);

export const validateListenFindConfig = (config) => config === undefined ||
    guardObject({
        extraction: FindConfig.extraction,
        returnOnly: FindConfig.returnOnly,
        excludeFields: FindConfig.excludeFields,
        disableAuth: FindConfig.disableAuth,
        episode: t => [undefined, 0, 1].includes(t)
    }).validate(config);

export const validateFindObject = command =>
    guardObject({
        // path: GuardSignal.TRIMMED_NON_EMPTY_STRING,
        find: (t, p) => (t === undefined && p.findOne) || (!p.findOne && FilterFootPrint(t)),
        findOne: (t, p) => (t === undefined && p.find) || (!p.find && FilterFootPrint(t)),
        sort: t => t === undefined || Validator.TRIMMED_NON_EMPTY_STRING(t),
        direction: (t, p) => t === undefined || (p.sort && DirectionList.includes(t)),
        limit: t => t === undefined || Validator.POSITIVE_INTEGER(t),
        random: (t, p) => t === undefined || (!p.sort && t === true),
    }).validate({ ...command });

export const assignExtractionFind = (data, find) => {
    if (!find) return find;

    if (niceGuard({ $dynamicValue: GuardSignal.NON_EMPTY_STRING }, find)) {
        return grab(data, find.$dynamicValue) || null;
    } else if (Validator.OBJECT(find)) {
        return Object.fromEntries(
            Object.entries(find).map(([k, v]) =>
                Validator.JSON(v) ? [k, assignExtractionFind(data, v)] : [k, v]
            )
        );
    } else if (Array.isArray(find)) {
        return find.map(v => assignExtractionFind(data, v));
    } else return find;
};

export const validateCollectionName = collectionName => {
    // Check if the collection name is empty
    if (!collectionName || typeof collectionName !== 'string')
        throw `collection name must be a non-empty string but got ${collectionName}`;

    // Collection name cannot start with 'system.' (reserved)
    if (collectionName.startsWith('system.'))
        throw `collection name cannot start with 'system.' but got ${collectionName}`;

    // Collection name cannot contain the '$' character
    if (collectionName.includes('$'))
        throw `collection name cannot contain the '$' character but got ${collectionName}`;
}

function isValidCollectionName(collectionName) {
    try {
        validateCollectionName(collectionName);
        return true;
    } catch (_) {
        return false;
    }
};

export const validateFilter = (filter) => testDocument({}, filter);