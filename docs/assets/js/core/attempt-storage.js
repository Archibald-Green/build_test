const ATTEMPT_PREFIX = "test-platform:attempt:";

function getAttemptPrefix(testId) {
  return `${ATTEMPT_PREFIX}${testId}:v`;
}

export function getAttemptKey(testId, testVersion) {
  return `${getAttemptPrefix(testId)}${testVersion}`;
}

function createUnavailableResult(error = null) {
  return {
    available: false,
    error,
    load() {
      return null;
    },
    save() {
      return false;
    },
    remove() {
      return false;
    },
    findIncompatible() {
      return [];
    },
    discardIncompatible() {
      return false;
    },
  };
}

export function createAttemptStorage(testId, testVersion) {
  const key = getAttemptKey(testId, testVersion);
  const prefix = getAttemptPrefix(testId);
  let storage;
  let available = true;
  let lastError = null;

  try {
    storage = window.localStorage;
    const probeKey = `${ATTEMPT_PREFIX}storage-probe`;
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
  } catch (error) {
    return {
      ...createUnavailableResult(error),
      key,
    };
  }

  function markUnavailable(error) {
    available = false;
    lastError = error;
    return false;
  }

  function findIncompatible() {
    const attempts = [];

    try {
      for (let index = 0; index < storage.length; index += 1) {
        const storedKey = storage.key(index);

        if (storedKey?.startsWith(prefix) && storedKey !== key) {
          attempts.push(storedKey);
        }
      }
    } catch (error) {
      markUnavailable(error);
      return [];
    }

    return attempts;
  }

  return {
    get available() {
      return available;
    },
    get error() {
      return lastError;
    },
    key,
    load() {
      try {
        const saved = storage.getItem(key);
        return saved ? JSON.parse(saved) : null;
      } catch (error) {
        if (error instanceof SyntaxError) {
          return null;
        }
        markUnavailable(error);
        return null;
      }
    },
    save(attempt) {
      try {
        storage.setItem(key, JSON.stringify(attempt));
        return true;
      } catch (error) {
        return markUnavailable(error);
      }
    },
    remove() {
      try {
        storage.removeItem(key);
        return true;
      } catch (error) {
        return markUnavailable(error);
      }
    },
    findIncompatible,
    discardIncompatible() {
      try {
        findIncompatible().forEach((storedKey) => storage.removeItem(storedKey));
        return true;
      } catch (error) {
        return markUnavailable(error);
      }
    },
  };
}
