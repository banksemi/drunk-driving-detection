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
 * System info module
 * @requires {@link core/event}
 * @requires {@link core/tizen}
 * @namespace core/systeminfo
 * @memberof core
 */

define({
    name: 'core/systeminfo',
    requires: [
        'core/event',
        'core/tizen'
    ],
    def: function coreSystemInfo(e, tizen) {
        'use strict';

        var systeminfo = null,
            lowBattery = 0.04;

        function noop() {
            return;
        }

        /**
         * Gets system property
         * @memberof core/systeminfo
         * @param {string} property Property name.
         * @param {function} onSuccess Success callback.
         * @param {function} onError Error callback.
         */
        function getSystemProperty(property, onSuccess, onError) {
            systeminfo.getPropertyValue(property, onSuccess, onError);
        }

        /**
         * Add listener for battery change to low
         * @memberof core/systeminfo
         * @fires "battery.low"
         */
        function listenBatteryLowState() {
            systeminfo.addPropertyValueChangeListener(
                'BATTERY',
                function change(battery) {
                    if (!battery.isCharging) {
                        e.fire('battery.low');
                    }
                },
                {
                    lowThreshold: lowBattery
                }
            );
        }

        /**
         * Check low battery state
         * @memberof core/systeminfo
         * @fires "battery.low"
         * @fires "battery.normal"
         * @fires "battery.checked"
         */
        function checkBatteryLowState() {
            systeminfo.getPropertyValue('BATTERY', function getValue(battery) {
                if (battery.level < lowBattery && !battery.isCharging) {
                    e.fire('battery.low', {
                        level: battery.level
                    });
                } else {
                    e.fire('battery.normal');
                }
                e.fire('battery.checked');
            }, null);
        }

        /**
         * Initialise module.
         * @memberof core/systeminfo
         * @private
         */
        function init() {
            if (typeof tizen === 'object' &&
                    typeof tizen.systeminfo === 'object') {
                systeminfo = tizen.systeminfo;
            } else {
                console.warn(
                    'tizen.systeminfo not available'
                );
                systeminfo = {
                    getPropertyValue: noop,
                    addPropertyValueChangeListener: noop
                };
            }
        }

        return {
            getSystemProperty: getSystemProperty,
            checkBatteryLowState: checkBatteryLowState,
            listenBatteryLowState: listenBatteryLowState,
            init: init
        };
    }
});
