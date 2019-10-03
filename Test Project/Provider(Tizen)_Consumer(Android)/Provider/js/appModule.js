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

/* global console, define */

/**
 * App module.
 *
 * @module app
 * @requires {@link views/init}
 * @namespace app
 */

define({
    name: 'app',
    requires: [
               'models/heartRate',
               'core/event'
    ],
    def: function appInit(req) {
        'use strict';

        var event = req.core.event, heartRate = req.models.heartRate;
        console.log('app::def');

        /**
         * Initializes App module.
         *
         * @memberof app
         * @public
         */
        function init() {
            console.log('app::init');
            heartRate.start();
            function onHeartRateDataChange(info)
            {
            	console.log("HeartRate: "+ info.detail.rate);
            }
            event.on({
                'models.heartRate.change': onHeartRateDataChange
            });
        }

        return {
            init: init
        };
    }
});
