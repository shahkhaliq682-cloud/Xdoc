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
