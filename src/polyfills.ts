declare global {
  interface Set<T> {
    isSubsetOf(other: Set<T>): boolean
  }
}

if (!Set.prototype.isSubsetOf) {
  Set.prototype.isSubsetOf = function<T>(this: Set<T>, other: Set<T>): boolean {
    for (const item of this) {
      if (!other.has(item)) return false;
    }

    return true;
  }
}