import { auth } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  
  const authInfo = {
    userId: auth.currentUser?.uid || null,
    email: auth.currentUser?.email || null,
    emailVerified: auth.currentUser?.emailVerified || null,
    isAnonymous: auth.currentUser?.isAnonymous || null,
    tenantId: auth.currentUser?.tenantId || null,
    providerInfo: auth.currentUser?.providerData?.map(provider => ({
      providerId: provider.providerId,
      email: provider.email,
    })) || []
  };

  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo,
    operationType,
    path
  };

  try {
    // Basic circular reference safe stringify
    const cache = new Set();
    const json = JSON.stringify(errInfo, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular]';
        }
        cache.add(value);
      }
      return value;
    });
    console.error('Firestore Error:', json);
    throw new Error(json);
  } catch (e) {
    // Fallback in case even the circular-safe stringify fails or if we're already handling a stringify error
    const fallbackMsg = `Firestore Error [${operationType}] on [${path}]: ${message}`;
    console.error(fallbackMsg, authInfo);
    throw new Error(fallbackMsg);
  }
}

/**
 * Recursively converts Firestore custom types (like Timestamps, DocumentReferences, etc.)
 * into simple serializable primitives so that they never cause circular reference/serialization errors
 * when inspected by loggers, devtools, or platform integrations.
 */
export function sanitizeFirestoreData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle firestore Timestamp specifically (has toDate method and seconds/nanoseconds)
  if (typeof data === 'object' && typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }

  // Handle standard JS Date
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle DocumentReference specifically or other Firestore class objects
  if (typeof data === 'object' && data.firestore && typeof data.path === 'string') {
    return { id: data.id, path: data.path };
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeFirestoreData(item));
  }

  // Handle plain Objects
  if (typeof data === 'object') {
    const proto = Object.getPrototypeOf(data);
    if (proto && proto !== Object.prototype && proto !== null) {
      if (typeof data.toJSON === 'function') {
        try {
          return sanitizeFirestoreData(data.toJSON());
        } catch (e) {
          // ignore error
        }
      }
      return `[ClassInstance: ${data.constructor.name || 'Unknown'}]`;
    }

    const sanitized: any = {};
    for (const key of Object.keys(data)) {
      sanitized[key] = sanitizeFirestoreData(data[key]);
    }
    return sanitized;
  }

  // Primitives
  return data;
}

