class DB {
    constructor(name, version = 1) {
        this.name = name;
        this.version = version;
        this.connection = null;
    }

    open(storeName, keyPath = "id", indexes = []) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, this.version);

            request.onupgradeneeded = (event) => {
                this.connection = event.target.result;

                if (!this.connection.objectStoreNames.contains(storeName)) {
                    const objectStore = this.connection.createObjectStore(storeName, { keyPath });

                    indexes.forEach(index => {
                        objectStore.createIndex(index.name, index.keyPath, { unique: index.unique });
                    });
                }
            };

            request.onsuccess = (event) => {
                this.connection = event.target.result;
                resolve(this.connection);
            };

            request.onerror = (event) => {
                reject(`Database error: ${event.target.errorCode}`);
            };
        });
    }

    getData(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.connection.transaction([storeName]);
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.get(key);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(`Failed to retrieve data for key: ${key}`);
            };
        });
    }

    add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.connection.transaction([storeName], "readwrite");
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.add(data);

            request.onerror = () => {
                reject(`Failed to add data: ${request.error}`);
            };
        });
    }

    remove(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.connection.transaction([storeName], "readwrite");
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.delete(key);

            request.onsuccess = () => {
                resolve(`Data with key ${key} removed successfully.`);
            };

            request.onerror = () => {
                reject(`Failed to remove data with key: ${key}`);
            };
        });
    }
}


