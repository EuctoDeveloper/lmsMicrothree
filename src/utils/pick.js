export const pick = (object, keys) => {
    return keys.reduce((picked, key) => {
        picked[key] = object[key];
        return picked;
    }, {});
}