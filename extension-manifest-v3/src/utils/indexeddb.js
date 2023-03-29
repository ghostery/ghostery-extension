import { deleteDB } from 'idb';

const dbs = new Set();

export function registerDatabase(name) {
  dbs.add(name);
  return name;
}

export async function deleteDatabases() {
  const names = indexedDB.databases
    ? (await indexedDB.databases()).map((db) => db.name)
    : [...dbs];
  await Promise.all(
    names.map((name) => {
      console.log(`[devtools] Deleting indexedDB database '${name}'`);
      return deleteDB(name, {
        blocked() {
          console.error(
            `Failed to delete database ${name} because it is blocked`,
          );
        },
      });
    }),
  );
}
