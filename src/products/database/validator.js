import { guardArray, GuardError, guardObject, GuardSignal, niceGuard, Validator } from "guard-object";
import { RETRIEVAL } from "../../helpers/values";
import { bboxPolygon } from '@turf/bbox-polygon';
import { booleanIntersects } from '@turf/boolean-intersects';
import { booleanWithin } from '@turf/boolean-within';
import { circle } from '@turf/circle';
import { distance } from '@turf/distance';
import { polygon } from "@turf/helpers";
import { grab } from "poke-object";
import { Buffer } from "buffer";

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

function isValidDatabaseName(dbName) {
    // Check if the database name is empty
    if (!dbName || typeof dbName !== 'string') {
        return false;
    }

    // Database name must be less than 64 characters
    if (Buffer.byteLength(dbName, 'utf8') >= 64) {
        return false;
    }

    // Database name cannot contain invalid characters: / \ " . $ space
    const invalidDbChars = /[\/\\."$ ]/;
    if (invalidDbChars.test(dbName)) {
        return false;
    }

    return true;
}

function isValidCollectionName(collectionName) {
    try {
        validateCollectionName(collectionName);
        return true;
    } catch (_) {
        return false;
    }
};

export const validateFilter = (filter) => confirmFilterDoc({}, filter);

export const confirmFilterDoc = (data, filter) => {
    if (!Validator.OBJECT(filter)) throw `expected an object as filter value but got ${filter}`;

    const logicalList = ['$and', '$or', '$nor'];
    const logics = [[], [], []]; // [$and, $or, $nor]

    Object.entries(filter).forEach(([key, value]) => {
        if (logicalList.includes(key)) {
            if (!Array.isArray(value)) throw `"${key}" must be an array`;
            if (!value.length) throw `"${key}" must be a nonempty array`;
            logics[logicalList.indexOf(key)].push(...value.map(v => evaluateFilter(data, v)));
        } else logics[0].push(evaluateFilter(data, { [key]: value }));
    });
    const [AND, OR, NOR] = logics;

    return !AND.some(v => !v) &&
        (!OR.length || OR.some(v => v)) &&
        (!NOR.length || NOR.some(v => !v));
};

const plumeDoc = doc => [doc, ...Array.isArray(doc) ? doc : []];

export const CompareBson = {
    equal: (doc, q, explicit) => {
        if (q instanceof RegExp) {
            return doc instanceof RegExp
                ? (doc.source === q.source && doc.flags === q.flags)
                : (explicit && typeof doc === 'string' && q.test(doc));
        }

        return JSON.stringify(doc) === JSON.stringify(q)
    },
    greater: (doc, q) => {
        return typeof doc === typeof q &&
            ![q, doc].some(v => Array.isArray(v) || Validator.OBJECT(v)) &&
            doc > q;
    },
    lesser: (doc, q) => {
        return typeof doc === typeof q &&
            ![q, doc].some(v => Array.isArray(v) || Validator.OBJECT(v)) &&
            doc < q;
    }
};

const BsonTypeMap = {
    double: [1, d => Validator.NUMBER(d) || typeof d?.$numberDouble === 'string'],
    string: [2, d => typeof d === 'string'],
    object: [3, d => Validator.OBJECT(d)],
    array: [4, d => Array.isArray(d)],
    binData: [5, d => Buffer.isBuffer(d) || typeof d?.$binary?.base64 === 'string'],
    objectId: [7, d =>
        typeof d?.$oid === 'string' ||
        (typeof d === 'string' && validateHexString(d))
    ],
    bool: [8, d => typeof d === 'boolean'],
    date: [9, d => d instanceof Date || d?.$date?.$numberLong],
    null: [10, d => d === null],
    regex: [11, d => d instanceof RegExp || Validator.OBJECT(d?.$regularExpression)],
    dbPointer: [12, d =>
        (typeof d?.$ref === 'string' && d?.$id) ||
        (typeof d?.$dbPointer?.$ref === 'string' && typeof d?.$dbPointer?.$id === 'string')
    ],
    javascript: [13, d => typeof d?.code === 'string' || typeof d?.$code === 'string'],
    symbol: [14, d => typeof d?.$symbol === 'string'],
    int: [16, d => Validator.INTEGER(d) || !!(d?.$numberInt || d?.$numberLong)],
    timestamp: [17, d => !!d?.$timestamp],
    long: [18, d => typeof d?.$numberLong === 'string' || Validator.INTEGER(d)],
    decimal: [19, d => typeof d?.$numberDecimal === 'string'],
    minKey: [-1, d => d?.$minKey === 1],
    maxKey: [127, d => d?.$maxKey === 1],
    number: [undefined, d =>
        BsonTypeMap.decimal[1](d) ||
        Validator.NUMBER(d)
    ]
};

const COORDINATE_GUARD = [
    GuardSignal.COORDINATE.LONGITUDE_INT,
    GuardSignal.COORDINATE.LATITUDE_INT
];

function validateHexString(string) {
    if (string?.length !== 24)
        return false;
    for (let i = 0; i < 24; i++) {
        const char = string.charCodeAt(i);
        if ((char >= 48 && char <= 57) ||
            (char >= 97 && char <= 102) ||
            (char >= 65 && char <= 70)) {
            continue;
        }
        return false;
    }
    return true;
}

const validateGeoNear = q =>
    guardObject({
        $geometry: {
            type: 'Point',
            coordinates: COORDINATE_GUARD
        },
        $minDistance: (t, p) => Validator.POSITIVE_NUMBER(t) && p.$maxDistance > t,
        $maxDistance: (t, p) => Validator.POSITIVE_NUMBER(t) && p.$minDistance < t
    }).validate(q);

const FilterUtils = {
    $eq: (doc, q) => plumeDoc(doc).some(v =>
        CompareBson.equal(v, q)
    ),

    $ne: (doc, q) => !FilterUtils.$eq(doc, q),

    $gt: (doc, q) => plumeDoc(doc).some(v =>
        CompareBson.greater(v, q)
    ),

    $gte: (doc, q) => plumeDoc(doc).some(v =>
        CompareBson.greater(v, q) || CompareBson.equal(v, q)
    ),

    $lt: (doc, q) => plumeDoc(doc).some(v =>
        CompareBson.lesser(v, q)
    ),

    $lte: (doc, q) => plumeDoc(doc).some(v =>
        CompareBson.lesser(v, q) || CompareBson.equal(v, q)
    ),

    $in: (doc, q) => {
        if (!Array.isArray(q)) throw '$in needs an array';
        return plumeDoc(doc).some(v =>
            q.some(k => CompareBson.equal(v, k, true))
        );
    },

    $nin: (doc, q) => !FilterUtils.$in(doc, q),

    $all: (doc, q) => {
        if (!Array.isArray(q)) throw '$all needs an array';
        return plumeDoc(doc).filter(v =>
            q.some(k => CompareBson.equal(v, k, true))
        ).length >= q.length;
    },

    $size: (doc, q) => {
        if (!Validator.POSITIVE_INTEGER(q))
            throw `Failed to parse $size. Expected a positive integer in: $size: ${q}`;
        return Array.isArray(doc) && doc.length === q;
    },

    $type: (doc, q) => {
        if (q === undefined) return false;
        return plumeDoc(doc).some(docx => {
            if (q in BsonTypeMap) {
                return !!BsonTypeMap[q][1](docx);
            }
            const c = Object.entries(BsonTypeMap).find(([_, v]) => v[0] === q);
            if (c) return !!c[1][1](docx);
            if (typeof q === 'number') throw `Invalid numerical type code: ${q}`;
            throw `Unknown type name alias: ${q}`;
        });
    },

    $regex: (doc, q) => {
        return plumeDoc(doc).some(docx => {
            if (q instanceof RegExp) {
                return typeof docx === 'string' ? q.test(docx) :
                    (docx instanceof RegExp &&
                        docx.source === q.source &&
                        docx.flags === q.flags);
            }

            if (typeof q === 'string') {
                return typeof docx === 'string' &&
                    !!docx.match(q);
            }

            throw '$regex has to be a string or a regex';
        });
    },

    $exists: (doc, q) => {
        return q ? doc !== undefined : doc === undefined;
    },

    $ne: (doc, q) => !FilterUtils.$eq(doc, q),

    $text: (parent, q) => {
        guardObject({
            $search: GuardSignal.STRING,
            $field: t => Validator.STRING(t) || (t.length && niceGuard(guardArray(GuardSignal.STRING), t)),
            $caseSensitive: t => t === undefined || Validator.BOOLEAN(t)
        }).validate(q);
        let { $field, $search, $caseSensitive } = q;

        $field = (Array.isArray($field) ? $field : [$field]).map(v => {
            const f = grab({ ...parent }, v);
            return typeof f === 'string' ? f : '';
        }).join(' ');

        if (!$caseSensitive) {
            $field = $field.toLowerCase();
            $search = $search.toLowerCase();
        }

        return $field.includes($search);
    },

    $geoIntersects: (doc, q) => {
        if (
            !niceGuard({
                $geometry: {
                    type: 'Point',
                    coordinates: COORDINATE_GUARD
                }
            }, q) &&
            !niceGuard({
                $geometry: {
                    type: 'LineString',
                    coordinates: [COORDINATE_GUARD, COORDINATE_GUARD]
                }
            }, q) &&
            !niceGuard({
                $geometry: {
                    type: 'Polygon',
                    coordinates: guardArray(guardArray(COORDINATE_GUARD))
                }
            }, q) &&
            !niceGuard({
                $geometry: {
                    type: 'MultiPoint',
                    coordinates: guardArray(COORDINATE_GUARD)
                }
            }, q) &&
            !niceGuard({
                $geometry: {
                    type: 'MultiLineString',
                    coordinates: guardArray([COORDINATE_GUARD, COORDINATE_GUARD])
                }
            }, q) &&
            !niceGuard({
                $geometry: {
                    type: 'MultiPolygon',
                    coordinates: guardArray(guardArray(guardArray(COORDINATE_GUARD)))
                }
            }, q)
        ) throw `unknown operator: ${q}`;

        try {
            return booleanIntersects(doc, q.$geometry);
        } catch (_) {
            return false;
        }
    },
    $geoWithin: (doc, q) => {
        const { $box, $geometry, $center, $centerSphere, $polygon } = { ...q };
        try {
            if ($geometry) {
                if (
                    niceGuard({
                        $geometry: {
                            type: 'Polygon',
                            coordinates: guardArray(guardArray(COORDINATE_GUARD))
                        }
                    }, q) ||
                    niceGuard({
                        $geometry: {
                            type: 'MultiPolygon',
                            coordinates: guardArray(guardArray(guardArray(COORDINATE_GUARD)))
                        }
                    }, q)
                ) {
                    return booleanWithin(doc, $geometry);
                }
            } else if ($box) {
                guardObject({ $box: Array(2).fill(COORDINATE_GUARD) }).validate(q);

                const [bottomLeft, topRight] = $box;
                const boundingBox = bboxPolygon([bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]]);
                return booleanWithin(doc, boundingBox);
            } else if ($center) {
                guardObject({ $center: [COORDINATE_GUARD, GuardSignal.POSITIVE_NUMBER] }).validate(q);

                const [center, radius] = $center;
                return booleanWithin(doc, circle(center, radius, { units: 'kilometers' }));
            } else if ($centerSphere) {
                guardObject({ $centerSphere: [COORDINATE_GUARD, GuardSignal.POSITIVE_NUMBER] }).validate(q);

                const [center, radius] = $centerSphere;
                // Convert radians to km
                return booleanWithin(doc, circle(center, radius * 6371, { units: 'kilometers' }));
            } else if ($polygon) {
                guardObject({ $polygon: guardArray(COORDINATE_GUARD) }).validate(q);
                return booleanWithin(doc, polygon([$polygon]));
            }
        } catch (e) {
            if (!(e instanceof GuardError)) return false;
        }
        throw `unknown operator: ${JSON.stringify(q)}`;
    },
    $near: (doc, q) => {
        validateGeoNear(q);
        try {
            const { $geometry, $maxDistance, $minDistance } = q;
            const distanceOffset = distance($geometry, doc);

            if ($minDistance && distanceOffset < $minDistance) {
                return false;
            }

            if ($maxDistance && distanceOffset > $maxDistance) {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    },
    $nearSphere: (doc, q) => {
        validateGeoNear(q);
        try {
            const { $geometry, $maxDistance, $minDistance } = q.$nearSphere;
            const distanceOffset = distance($geometry, doc, { units: 'degrees' });

            if ($minDistance && distanceOffset < $minDistance) {
                return false;
            }

            if ($maxDistance && distanceOffset > $maxDistance) {
                return false;
            }

            return true;
        } catch (_) {
            return false;
        }
    }
};

const evaluateFilter = (data, filter = {}, parentData, level = 0) => {
    if (!Validator.OBJECT(filter)) throw `filter must be a raw object but got ${filter}`;
    if (!level) parentData = data;

    const logics = [];

    Object.entries(filter).map(([key, value]) => {
        if (key.startsWith('$') && (key !== '$text' || !Validator.OBJECT(value)) && !level)
            throw `unknown top level operator: ${key}`;

        let thisData;
        try {
            thisData = data && grab(data, key);
        } catch (_) { }

        if (key === '$text' && !level) {
            logics.push(FilterUtils.$text(parentData, value));
        } else if (Validator.OBJECT(value) && !level) {
            const valueEntrie = Object.entries(value);

            if (valueEntrie.some(([k]) => k.startsWith('$'))) {
                valueEntrie.forEach(([query, queryValue]) => {
                    if (query in FilterUtils) {
                        if (query === '$text' && level) throw '$text must be a top level operator';
                        logics.push(FilterUtils[query](thisData, queryValue));
                    } else if (query === '$not') {
                        if (Validator.OBJECT(queryValue)) {
                            logics.push(!evaluateFilter(thisData, queryValue, parentData, level + 1));
                        } else logics.push(
                            !plumeDoc(thisData).some(v => CompareBson.equal(v, queryValue, true))
                        );
                    } else throw `unknown operator: ${query}`;
                });
            } else if (valueEntrie.length) {
                logics.push(evaluateFilter(thisData, value, parentData, level + 1));
            } else {
                logics.push(
                    Validator.OBJECT(thisData) &&
                    !Object.keys(thisData).length
                );
            }
        } else {
            logics.push(
                plumeDoc(thisData).some(v => CompareBson.equal(v, value, true))
            );
        }
    });

    return !logics.some(v => !v);
};