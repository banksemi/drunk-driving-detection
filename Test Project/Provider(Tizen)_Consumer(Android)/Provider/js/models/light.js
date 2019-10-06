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
    name: 'models/light',
    requires: [
    ],
    def: function modelsLight() {
        'use strict';
        var data = null;
        
        function init() {
        	var sensor  = tizen.sensorservice.getDefaultSensor("LIGHT");
        	sensor.start(onsuccessCB);
        	
        	setInterval(function(){
        		sensor.getLightSensorData(
    				function(sensorData){
            			data = sensorData.lightLevel;
            		},
                    onerrorCB
                );
        		
        	}, 1000);
        }
        
    	function onerrorCB(error)
    	{
    	  console.log("Error occurred");
    	}

    	function onsuccessCB()
    	{
    	  console.log("Sensor start");
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
