
import { openDB, IDBPDatabase } from 'idb';
import { CorpusItem } from '../types';

const DB_NAME = 'VeroBrixDB';
const DB_VERSION = 2; // Increment DB version
const KEY_STORE_NAME = 'cryptoKeys';
const CORPUS_STORE_NAME = 'legalCorpus';

let dbPromise: Promise<IDBPDatabase> | null = null;

const initDB = () => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains(KEY_STORE_NAME)) {
          db.createObjectStore(KEY_STORE_NAME);
        }
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains(CORPUS_STORE_NAME)) {
          const store = db.createObjectStore(CORPUS_STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('Source', 'Source');
          store.createIndex('Jurisdiction', 'Jurisdiction');
          store.createIndex('RuleNumber_Section', 'RuleNumber_Section');
          store.createIndex('Citation', 'Citation', { unique: true });
        }
      }
    },
  });
  return dbPromise;
};

export const saveKey = async (key: CryptoKey, type: 'publicKey' | 'privateKey') => {
  const db = await initDB();
  return db.put(KEY_STORE_NAME, key, type);
};

export const loadKey = async (type: 'publicKey' | 'privateKey'): Promise<CryptoKey | undefined> => {
  const db = await initDB();
  return db.get(KEY_STORE_NAME, type);
};

export const clearKeys = async () => {
  const db = await initDB();
  return db.clear(KEY_STORE_NAME);
};

// --- Legal Corpus Functions ---

export const addCorpusItems = async (items: CorpusItem[]) => {
  const db = await initDB();
  const tx = db.transaction(CORPUS_STORE_NAME, 'readwrite');
  const promises = items.map(item => tx.store.put(item));
  await Promise.all(promises);
  return tx.done;
};

export const getCorpusItems = async (indexName: string, query: string): Promise<CorpusItem[]> => {
  const db = await initDB();
  // This is a simple query for now. We can build more complex ones later.
  return db.getAllFromIndex(CORPUS_STORE_NAME, indexName, query);
};
