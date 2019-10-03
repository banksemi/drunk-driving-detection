/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*global define, console*/

/**
 * Simple storage module, implemented using IndexedDB.
 * @requires {@link core/event}
 * @requires {@link core/window}
 * @namespace core/storage/idb
 * @memberof core
 */

define({
    name: 'core/storage/idb',
    requires: [
        'core/event',
        'core/window'
    ],
    def: function coreStorage(req) {
        'use strict';

        var global = req.core.window,
            indexedDB = global.indexedDB || global.webkitIndexedDB,
            IDBKeyRange = global.IDBKeyRange || global.webkitIDBKeyRange,
            e = req.core.event,
            DB_NAME = 'corestorage',
            STORE_NAME = 'kvstore',
            VERSION = 5, // increment the value when db structure changes

            // this module fires the following events
            EVENT_OPEN = 'open', // db is open and ready to be used
            EVENT_READ = 'read', // read request completed
            EVENT_WRITE = 'write', // write request completed
            EVENT_REMOVE = 'remove', // remove request completed
            EVENT_COMPLETED = 'completed', // cleared pending requests

            requestsCounter = -1,
            pending = {},
            db = null;

        /**
         * @memberof core/storage/idb
         */
        function isReady() {
            return db !== null;
        }

        /**
         * Add a request to the list of pending requests.
         * @param {string} eventName
         * @param {string} key
         * @param {*} [value]
         * @return {number} unique request ID.
         */
        function addPendingRequest(eventName, key, value) {
            requestsCounter += 1;
            pending[requestsCounter] = {
                eventName: eventName,
                key: key,
                value: value
            };
            return requestsCounter;
        }

        /**
         * Get pending request data.
         * Returns 'undefined' if the request is already completed.
         * @memberof core/storage/idb
         * @param {number} id
         * @return {object}
         */
        function getPendingRequest(id) {
            return pending[id];
        }

        /**
         * Checks if there are any pending requests.
         * @memberof core/storage/idb
         * @return {boolean}
         */
        function hasPendingRequests() {
            return Object.keys(pending).length !== 0;
        }

        /**
         * Remove a completed request from the list of pending requests.
         * The request should be removed not earlier than all relevant
         * handlers have finished processing.
         * @param {type} id
         */
        function removePendingRequest(id) {
            delete pending[id];
            if (!hasPendingRequests()) {
                e.fire(EVENT_COMPLETED);
            }
        }

        /**
         * Generic error handler for IndexedDB-related objects.
         * @param {Error} err
         */
        function onerror(err) {
            console.error(err.target.error.message);
        }

        /**
         * Creates or updates database structure.
         * @param {Event} ev
         */
        function onUpgradeNeeded(ev) {
            var resultDb = ev.target.result;

            // a transaction for changing db version starts automatically
            ev.target.transaction.onerror = onerror;

            // remove the existing store and create it again
            if (resultDb.objectStoreNames.contains(STORE_NAME)) {
                resultDb.deleteObjectStore(STORE_NAME);
            }

            resultDb.createObjectStore(
                STORE_NAME,
                {keyPath: 'key'}
            );
        }

        /**
         * Assigns database object.
         * This handler is executed right after the upgrade.
         * This method fires the core.storage.open event upon completion.
         * @param {Event} ev
         */
        function onOpenSuccess(ev) {
            db = ev.target.result;
            e.fire(EVENT_OPEN);
        }

        /**
         * Open the database.
         */
        function open() {
            // create a request for opening the database
            var request = indexedDB.open(DB_NAME, VERSION);

            // one or more of the handlers will be called
            // automatically when the current function exits
            request.onupgradeneeded = onUpgradeNeeded;
            request.onsuccess = onOpenSuccess;
            request.onerror = onerror;
        }

        /**
         * Gets value for given key from the storage.
         * The method fires the core.storage.read event upon completion.
         * @memberof core/storage/idb
         * @param {string} key Key.
         * @return {number} Request id.
         */
        function get(key) {
            var trans = db.transaction([STORE_NAME], 'readwrite'),
                store = trans.objectStore(STORE_NAME),

                // Find the key in the store
                keyRange = IDBKeyRange.only(key),
                id = addPendingRequest(EVENT_READ, key),
                cursorRequest = store.openCursor(keyRange);

            cursorRequest.onsuccess = function onCursorOpenSuccess(ev) {
                var error = null,
                    cursor = ev.target.result;

                if (!cursor) {
                    error = new Error('No records returned');
                    error.name = 'StorageNotFoundError';

                    e.fire(EVENT_READ, {
                        id: id,
                        key: key,
                        error: error
                    });
                    removePendingRequest(id);
                } else {
                    e.fire(EVENT_READ, {
                        id: id,
                        key: cursor.value.key,
                        value: cursor.value.value
                    });
                }
                removePendingRequest(id);
            };

            cursorRequest.onerror = function onCursorOpenError(err) {
                removePendingRequest(id);
                console.error(err.target.error.message);
            };

            return id;
        }

        /**
         * Sets value for given key to the storage.
         * The method fires the core.storage.write event upon completion.
         * @memberof core/storage/idb
         * @param {string} key Key.
         * @param {object} val Value object.
         * @return {boolean}
         */
        function set(key, val) {
            var trans = db.transaction([STORE_NAME], 'readwrite'),
                store = trans.objectStore(STORE_NAME),
                request = store.put({
                    key: key,
                    value: val
                }),
                id = addPendingRequest(EVENT_WRITE, key, val);

            request.onsuccess = function onPutSuccess() {
                e.fire(
                    EVENT_WRITE,
                    {id: id, key: key, value: val}
                );
                removePendingRequest(id);
            };

            request.onerror = function onPutError(err) {
                console.error(err.target.error.message);
                removePendingRequest(id);
            };

            return id;
        }

        /**
         * Removes value with given key from the storage.
         * The method fires the core.storage.remove event upon completion.
         * @param {string} key Key name.
         * @return {number} id Id.
         */
        function removeItem(key) {
            var trans = db.transaction([STORE_NAME], 'readwrite'),
                store = trans.objectStore(STORE_NAME),
                id = addPendingRequest(EVENT_REMOVE, key),
                request = store.delete(key);

            request.onsuccess = function onDeleteSuccess() {
                e.fire(EVENT_REMOVE, {id: id, key: key});
                removePendingRequest(id);
            };

            request.onerror = function onDeleteError(err) {
                console.error(err.target.error.message);
                removePendingRequest(id);
            };
            return id;
        }

        /**
         * Removes keys from given array.
         * @param {string[]} keys Key array.
         */
        function removeItems(keys) {
            var ids = [];
            keys.forEach(function forEach(key) {
                ids.push(removeItem(key));
            });
            return ids;
        }

        /**
         * Removes value for given context.
         * @memberof core/storage/idb
         * @param {string|array} context Key name or keys array.
         * @return {number|array} id Id or ids array.
         */
        function remove(context) {
            var id = -1;
            if (typeof context === 'string') {
                id = removeItem(context);
            } else if (Array.isArray(context)) {
                id = removeItems(context);
            }
            return id;
        }

        function init() {
            open();
        }

        return {
            init: init,
            getPendingRequest: getPendingRequest,
            hasPendingRequests: hasPendingRequests,
            isReady: isReady,
            get: get,
            /**
             * Alias for {@link core/storage/idb.set}
             * @memberof core/storage/idb
             * @function
             * @see {@link core/storage/idb.set}
             */
            add: set,
            set: set,
            remove: remove
        };
    }
});
