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

/* global define, console, window, tizen */

/**
 * Heart Rate Monitor module.
 *
 * @module models/heartRate
 * @requires {@link core/event}
 * @requires {@link core/storage/idb}
 * @namespace models/heartRate
 * @memberof models/heartRate
 */

define({
    name: 'models/heartRate',
    requires: [
        'core/event',
        'core/storage/idb'
    ],
    def: function modelsHeartRate(req) {
        'use strict';

        /**
         * Core storage idb module object.
         *
         * @memberof models/heartRate
         * @private
         * @type {Module}
         */
        var indexedDB = req.core.storage.idb,

            /**
             * Core event module object.
             *
             * @memberof models/heartRate
             * @private
             * @type {Module}
             */
            event = req.core.event,

            /**
             * Specifies the human activity monitor type.
             *
             * @memberof models/heartRate
             * @private
             * @const {string}
             */
            CONTEXT_TYPE = 'HRM',

            /**
             * Specifies the set limit key in storage.
             *
             * @memberof models/heartRate
             * @private
             * @const{string}
             */
            STORAGE_IDB_KEY = 'limit',

            /**
             * Value of current heart rate.
             *
             * @memberof models/heartRate
             * @private
             * @type {object}
             */
            heartRate = null,

            /**
             * Object represents Heart Rate Monitor data.
             *
             * @memberof models/heartRate
             * @private
             * @type {object}
             */
            heartRateData = {};



        /**
         * Sets heart rate and time values received from sensor.
         * Returns heart rate data.
         *
         * @memberof models/heartRate
         * @private
         * @param {object} heartRateInfo
         * @returns {object}
         */
        function setHeartRateData(heartRateInfo) {
            var pData = {
                rate: heartRateInfo.heartRate,
                rrinterval: heartRateInfo.rRInterval
            };

            heartRateData = pData;
            return pData;
        }

        /**
         * Returns last received motion data.
         *
         * @memberof models/heartRate
         * @private
         * @returns {object}
         */
        function getData() {
            return heartRateData;
        }

        /**
         * Resets heart rate data.
         *
         * @memberof models/heartRate
         * @private
         */
        function resetData() {
            heartRateData = {
                rate: '-',
                rrinterval: '-'
            };
        }

        /**
         * Handles change event on current heart rate.
         *
         * @memberof models/heartRate
         * @private
         * @param {object} heartRateInfo
         * @fires models.heartRate.change
         */
        function handleHeartRateInfo(heartRateInfo) {
            setHeartRateData(heartRateInfo);
            event.fire('change', getData());
        }

        /**
         * Starts the sensor and registers a change listener.
         *
         * @memberof models/heartRate
         * @public
         */
        function start() {
            resetData();
            heartRate.start(
                CONTEXT_TYPE,
                function onSuccess(heartRateInfo) {
                    handleHeartRateInfo(heartRateInfo);
                },
                function onError(error) {
                    console.log('error: ', error.message);
                }
            );
        }

        /**
         * Stops the sensor and unregisters a previously registered listener.
         *
         * @memberof models/heartRate
         * @public
         */
        function stop() {
            heartRate.stop(CONTEXT_TYPE);
        }

        /**
         * Reads limit value from storage, what fires 'core.storage.idb.read'.
         *
         * @memberof models/heartRate
         * @public
         */
        function getLimit() {
            indexedDB.get(STORAGE_IDB_KEY);
        }

        /**
         * Sets limit value in storage.
         *
         * @memberof models/heartRate
         * @public
         * @param {object} value
         */
        function setLimit(value) {
            indexedDB.set(STORAGE_IDB_KEY, value);
        }

        /**
         * Handles 'core.storage.idb.write' event.
         *
         * @memberof models/heartRate
         * @private
         * @fires models.heartRate.setLimit
         */
        function onWriteLimit() {
            event.fire('setLimit');
        }

        /**
         * Handles 'core.storage.idb.read' event.
         *
         * @memberof models/heartRate
         * @private
         * @param {Event} e
         * @fires models.heartRate.getLimit
         */
        function onReadLimit(e) {
            event.fire('getLimit', e);
        }

        /**
         * Registers event listeners.
         *
         * @memberof models/heartRate
         * @private
         */
        function bindEvents() {

            event.on({
                'core.storage.idb.write': onWriteLimit,
                'core.storage.idb.read': onReadLimit
            });
        }

        /**
         * Initializes the module.
         *
         * @memberof models/heartRate
         * @public
         */
        function init() {
            bindEvents();
            resetData();
            if (indexedDB.isReady()) {
                getLimit();
            } else {
                event.listen('core.storage.idb.open', getLimit);
            }

            heartRate = (tizen && tizen.humanactivitymonitor) ||
                (window.webapis && window.webapis.motion) || null;
        }

        return {
            init: init,
            start: start,
            stop: stop,
            getLimit: getLimit,
            setLimit: setLimit
        };
    }
});
