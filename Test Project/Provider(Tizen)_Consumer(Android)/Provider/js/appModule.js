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
var DEBUG_MODE = false;
define({
    name: 'app',
    requires: [
               'models/heartRate',
               'models/motion',
               'models/light',
               'core/event'
    ],
    def: function appInit(req) {
        'use strict';

        var lastData = {};
        var event = req.core.event, heartRate = req.models.heartRate, motion=req.models.motion, light=req.models.light;
        console.log('app::def');

        function HeartRateSensorStart()
        {
        	heartRate.start();
            setTimeout(function (){
                heartRate.stop();
            }, 30000);
        }
        /**
         * Initializes App module.
         *
         * @memberof app
         * @public
         */
        function init() {
            console.log('app::init');
            function onHeartRateDataChange(info)
            {
            	lastData.heartRate = info.detail.rate;
            }
            event.on({
                'models.heartRate.change': onHeartRateDataChange
            });
            
            setInterval(function(){
            	if (SASocket != null && SASocket.isConnected() || DEBUG_MODE)
        		{
            		var message = {};
                	message.heartRate = lastData.heartRate;
                	message.motion = motion.getData();
                	message.timestamp = new Date().getTime();
                	message.light = light.getData();
                	if (DEBUG_MODE == true)
                    	console.log(JSON.stringify(message));
                	else
                		SASocket.sendData(SAAgent.channelIds[0], JSON.stringify(message));
        		}
            }, 1000);

        	HeartRateSensorStart();
            setInterval(HeartRateSensorStart, 60000);
        }

        return {
            init: init
        };
    }
});
