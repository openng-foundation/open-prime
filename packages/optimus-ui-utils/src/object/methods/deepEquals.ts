function _deepEquals(obj1: unknown, obj2: unknown, visited: WeakSet<object> = new WeakSet()): boolean {
    // Base case: same object reference
    if (obj1 === obj2) return true;

    // If one of them is null or not an object, directly return false
    if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

    // Check for circular references
    if (visited.has(obj1) || visited.has(obj2)) return false;

    // Add objects to the visited set
    visited.add(obj1).add(obj2);

    const arrObj1 = Array.isArray(obj1);
    const arrObj2 = Array.isArray(obj2);
    let i, length, key;

    if (arrObj1 && arrObj2) {
        length = obj1.length;
        if (length != obj2.length) return false;
        for (i = length; i-- !== 0; ) if (!_deepEquals(obj1[i], obj2[i], visited)) return false;

        return true;
    }

    if (arrObj1 != arrObj2) return false;

    const dateObj1 = obj1 instanceof Date,
        dateObj2 = obj2 instanceof Date;

    if (dateObj1 != dateObj2) return false;
    if (dateObj1 && dateObj2) return obj1.getTime() == obj2.getTime();

    const regexpObj1 = obj1 instanceof RegExp,
        regexpObj2 = obj2 instanceof RegExp;

    if (regexpObj1 != regexpObj2) return false;
    if (regexpObj1 && regexpObj2) return obj1.toString() == obj2.toString();

    const keys = Object.keys(obj1);

    length = keys.length;

    if (length !== Object.keys(obj2).length) return false;

    for (i = length; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(obj2, keys[i])) return false;

    for (i = length; i-- !== 0; ) {
        key = keys[i];
        if (!_deepEquals((obj1 as Record<string, unknown>)[key], (obj2 as Record<string, unknown>)[key], visited)) return false;
    }

    return true;
}

export default function deepEquals(obj1: unknown, obj2: unknown): boolean {
    return _deepEquals(obj1, obj2);
}
