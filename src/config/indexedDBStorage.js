/**
 * Noctis Vault - High Capacity Storage System (IndexedDB)
 * Permite almacenar una cantidad ilimitada de joyas y fotos/videos pesados
 * superando la restricción de ~5MB del LocalStorage tradicional.
 */

const DB_NAME = 'NoctisVaultDB';
const DB_VERSION = 1;
const STORE_NAME = 'products';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn('IndexedDB no está soportado en este navegador. Se usará localStorage.');
      return resolve(null);
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('Error al abrir IndexedDB NoctisVault:', event.target.error);
      resolve(null);
    };
  });
}

/**
 * Obtener todos los productos guardados en IndexedDB
 */
export async function getAllProductsDB() {
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Error obteniendo productos de IndexedDB:', request.error);
        resolve([]);
      };
    } catch (e) {
      console.error('Error en transacción de lectura IndexedDB:', e);
      resolve([]);
    }
  });
}

/**
 * Guardar o actualizar un producto individual en IndexedDB
 */
export async function saveProductDB(product) {
  const db = await openDB();
  if (!db || !product || !product.id) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(product);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        console.error('Error guardando producto en IndexedDB:', request.error);
        resolve(false);
      };
    } catch (e) {
      console.error('Error en transacción de escritura IndexedDB:', e);
      resolve(false);
    }
  });
}

/**
 * Guardar una lista completa de productos en IndexedDB
 */
export async function saveAllProductsDB(products = []) {
  const db = await openDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      // Limpiar y guardar todos los elementos
      const clearReq = store.clear();
      clearReq.onsuccess = () => {
        products.forEach((p) => {
          if (p && p.id) {
            store.put(p);
          }
        });
        resolve(true);
      };

      clearReq.onerror = () => resolve(false);
    } catch (e) {
      console.error('Error guardando lista de productos en IndexedDB:', e);
      resolve(false);
    }
  });
}

/**
 * Eliminar un producto por su ID de IndexedDB
 */
export async function deleteProductDB(id) {
  const db = await openDB();
  if (!db || !id) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    } catch (e) {
      console.error('Error eliminando producto de IndexedDB:', e);
      resolve(false);
    }
  });
}
