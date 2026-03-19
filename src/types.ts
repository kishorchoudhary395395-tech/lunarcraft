import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  minecraftUsername: string;
  role: 'admin' | 'user';
  createdAt: Timestamp | Date;
}

export interface Ticket {
  id: string;
  uid: string;
  category: string;
  subject: string;
  message: string;
  status: 'open' | 'pending' | 'closed';
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface Suggestion {
  id: string;
  uid: string;
  title: string;
  description: string;
  votes: number;
  status: 'under-review' | 'planned' | 'implemented';
  createdAt: Timestamp | Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'rank' | 'item' | 'perk';
  image: string;
}

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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}
