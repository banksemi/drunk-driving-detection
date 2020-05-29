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
/*jslint regexp: true*/

/**
 * Application module
 * @requires {@link core/event}
 * @requires {@link core/tizen}
 * @namespace core/application
 * @memberof core
 */

define({
    name: 'core/application',
    requires: [
        'core/event',
        'core/window',
        'core/tizen'
    ],
    def: function coreApplication(e, window, tizen) {
        'use strict';

        var app = null,
            navigator = window.navigator,
            APP_CONTROL_URL = 'http://tizen.org/appcontrol/';

        /**
         * Gets current application.
         * @memberof core/application
         */
        function getCurrentApplication() {
            return app.getCurrentApplication();
        }

        /**
         * Gets application control URI.
         * @memberof core/application
         * @param {object} operation Operation name.
         */
        function getAppControlUri(operation) {
            return APP_CONTROL_URL + operation;
        }

        /**
         * Gets current application id.
         * @memberof core/application
         */
        function getId() {
            return getCurrentApplication().appInfo.id;
        }

        /**
         * Launches application control.
         * @memberof core/application
         * @param {object} controlData Control data params.
         * @param {string} controlData.operation Operation uri.
         * @param {string} [controlData.mime] MIME type.
         */
        function launchAppControl(controlData) {
            var control = new tizen.ApplicationControl(
                    getAppControlUri(controlData.operation),
                    null,
                    controlData.mime || null
                ),
                replyCallback = {
                    onsuccess: function onsuccess(data) {
                        e.fire(
                            'replySuccess',
                            {
                                operation: controlData.operation,
                                data: data
                            }
                        );
                    },
                    onfailure: function onfailure() {
                        e.fire(
                            'replyFailure',
                            {
                                operation: controlData.operation
                            }
                        );
                    }
                };

            try {
                app.launchAppControl(
                    control,
                    null,
                    function successCallback() {
                        e.fire(
                            'launchSuccess',
                            {
                                operation: controlData.operation
                            }
                        );
                    },
                    function errorCallback(ev) {
                        e.fire(
                            'launchError',
                            {
                                operation: controlData.operation,
                                data: ev
                            }
                        );
                    },
                    replyCallback
                );
            } catch (e) {
                console.error(e.message);
            }
        }

        /**
         * Returns requested application control data.
         * @memberof core/application
         * @param {string} operation Action to be performed.
         * @return {object}
         */
        function getRequestedAppControlData(operation) {
            var rAppControl = getCurrentApplication().getRequestedAppControl(),
                appControl = null;

            if (rAppControl) {
                appControl = rAppControl.appControl;

                if (appControl.operation === operation) {
                    return appControl;
                }
            }

            return null;
        }

        /**
         * Creates ApplicationControl object.
         * @memberof core/application
         * @param {string} operation Action to be performed.
         */
        function createApplicationControl(operation) {
            return new tizen.ApplicationControl(getAppControlUri(operation));
        }

        /**
         * Checks if application is running in emulator.
         * @return {bool} Is emulated.
         */
        function isEmulated() {
            return navigator.platform.indexOf('emulated') !== -1;
        }

        /**
         * Application exit.
         * @memberof core/application
         */
        function exit() {
            getCurrentApplication().exit();
        }

        /**
         * Application hide.
         * @memberof core/application
         */
        function hide() {
            getCurrentApplication().hide();
        }

        /**
         * No operation.
         */
        function noop() {
            return;
        }

        if (typeof tizen === 'object' &&
                typeof tizen.application === 'object') {
            app = tizen.application;
        } else {
            console.warn(
                'tizen.application not available, using a mock instead'
            );
            app = {
                launchAppControl: noop,
                getCurrentApplication: function getApp() {
                    return {
                        getRequestedAppControl: noop,
                        exit: noop,
                        hide: noop
                    };
                }
            };
        }

        return {
            getId: getId,
            getCurrentApplication: getCurrentApplication,
            getAppControlUri: getAppControlUri,
            getRequestedAppControlData: getRequestedAppControlData,
            launchAppControl: launchAppControl,
            createApplicationControl: createApplicationControl,
            isEmulated: isEmulated,
            hide: hide,
            exit: exit
        };
    }

});
