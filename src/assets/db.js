import Dexie from 'dexie';

export const db = new Dexie('myDatabase');
db.version(3).stores({
  agreements:
    'id, no, dateReg, regNumber, contrAgent, egrpou, subject, addOns, responsible, dateExp, annotations, expired, autoRenew',
});

export default db;