import { update } from 'mingo/updater';

export const updateDocument = (document, modifier, isInsert) => {
    const { $setOnInsert, $set, ...rest } = modifier;

    const operations = { ...rest };

    if (isInsert && $setOnInsert) {
        operations.$set = {
            ...$set,
            ...$setOnInsert
        };
    } else if ($set) {
        operations.$set = $set;
    }

    return update(document, operations);
};