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



define({
    name: 'models/pedometer',
    requires: [
    ],
    def: function modelsPedometer() {
        'use strict';
        var data = null;
        
        function init() {
        	initData();
        	var pedometer = (tizen && tizen.humanactivitymonitor) ||
        	(window.webapis && window.webapis.motion) || null;
        	
        	pedometer.start("PEDOMETER", listener, errorCallback);
        	console.log(pedometer)
        }
        
        function errorCallback(error) {
            console.log(error.name + ': ' + error.message);
        }

        function listener(pedometerInfo) {
        	data = {
        			totalStep: pedometerInfo.cumulativeTotalStepCount,
        			stepStatus: pedometerInfo.stepStatus,
        			speed: pedometerInfo.speed
        	}
            data = info;
        }

        function initData()
        {
        	data = {
        			totalStep:0,
        			stepStatus: "UNKNOWN",
        			speed: 0
        	}
        }
        function getData()
        {
        	return data;
        }
        
        return {
            init: init,
            getData: getData
        };
    }
});
