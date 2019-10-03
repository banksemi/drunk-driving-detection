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
    name: 'models/motion',
    requires: [
    ],
    def: function modelsMotion() {
        'use strict';
        var data = {};
        function init() {
        	bindEvents();
        }
        
    	function onerrorCB(error)
    	{
    	  console.log("Error occurred");
    	}

    	function onsuccessCB()
    	{
    	  console.log("Sensor start");
    	}
        
        /**
         * Binds events.
         *
         * @memberof views/main
         * @private
         */
        function bindEvents() {
        	var gyroscopeSensor  = tizen.sensorservice.getDefaultSensor("GYROSCOPE");
        	var gyroscopeRotationVectorSensor  = tizen.sensorservice.getDefaultSensor("GYROSCOPE_ROTATION_VECTOR");
        	
        	gyroscopeSensor.start(onsuccessCB);
        	gyroscopeRotationVectorSensor.start(onsuccessCB);
        	
        	setInterval(function(){
        		gyroscopeSensor.getGyroscopeSensorData(function(sensorData){
        			data.Gyroscope = sensorData;
        		}, onerrorCB);
        		gyroscopeRotationVectorSensor.getGyroscopeRotationVectorSensorData(function(sensorData){
        			data.GyroscopeRotation = sensorData;
        		}, onerrorCB);
        	}, 200);
        	


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
