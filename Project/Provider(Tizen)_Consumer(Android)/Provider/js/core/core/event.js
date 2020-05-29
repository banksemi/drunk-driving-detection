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

/*jslint forin: true*/
/*global define*/

/**
 * Event module.
 * @requires {@link core/window}
 * @namespace core/event
 * @memberof core
 */

define({
    name: 'core/event',
    requires: [
        'core/window'
    ],
    def: function event(window) {
        'use strict';

        var listeners = {};

        /**
         * Gets listeners name for event.
         * @param {string} eventName Event name.
         * @return {array} Listeners names.
         */
        function getListenersNames(eventName) {
            var key,
                names = [],
                handlers = listeners[eventName];

            for (key in handlers) {
                names.push(handlers[key].name);
            }
            return names;
        }

        /**
         * Gets listeners for event.
         * @memberof core/event
         * @param {string} [eventName] Event name.
         * @return {object} Listeners names.
         */
        function getListeners(eventName) {
            var evName,
                names = {};

            if (eventName) {
                names[eventName] = getListenersNames(eventName);
            } else {
                for (evName in listeners) {
                    names[evName] = getListenersNames(evName);
                }
            }
            return names;
        }

        /**
         * Dispatches an event
         * @param {string} eventName Event name.
         * @param {*} data Detailed data.
         * @return {boolean} Cancelled.
         */
        function dispatch(eventName, data) {
            var customEvent = new window.CustomEvent(eventName, {
                    detail: data,
                    cancelable: true
                });
            return window.dispatchEvent(customEvent);
        }

        /**
         * Dispatches an event of given name and detailed data.
         *
         * Dispatched event name is prefixed with name of
         * module which dispatched event.
         *
         * For example if event with `test` name will be dispatched from
         * `foo` module, listener should be added to `foo.test`.
         *
         * The return value is false if at least one of the event handlers
         * which handled this event called event.preventDefault().
         * Otherwise it returns true.
         *
         * @memberof core/event
         *
         * @example
         * // Define `bar` module which fires an event:
         * define({
         *     name: 'bar',
         *     requires: 'core/event',
         *     def: function def(ev) {
         *         // Dispatch event
         *         ev.dispatchEvent('test');
         *
         *         // or:
         *         // ev.fire('test');
         *     }
         * });
         * @see {@link core/event.addEventListener} How to add event listener.
         *
         * @param {string} eventName Event name.
         * @param {*} [data] Detailed data.
         * @return {boolean}
         */
        function dispatchEvent(eventName, data) {
            /*jshint validthis: true */
            var customEvName = this.evName + '.' + eventName;
            return dispatch(customEvName, data);

        }

        /**
         * Dispatches an event of given name and detailed data.
         *
         * Since every new fired event has prefixed module name
         * this method is deprecated.
         *
         * For example if event with `test` name will be dispatched from
         * `foo` module, listener should be added to `test`.
         *
         * Please use new dispatchEvent.
         * This method can be used only for backward compatibility.
         *
         * @memberof core/event
         * @deprecated Since v2.0.
         *
         * @example
         * // Define `bar` module which fires an event:
         * define({
         *     name: 'bar',
         *     requires: 'core/event',
         *     def: function def(ev) {
         *         // Dispatch event
         *         ev.shoot('test');
         *     }
         * });
         * @see {@link core/event.addEventListener} How to handle fired event.
         *
         * @param {string} eventName Event name.
         * @param {*} [data] Detailed data.
         * @return {boolean} Cancelled.
         */
        function shoot(eventName, data) {
            return dispatch(eventName, data);
        }

        /**
         * Adds event listener for event name.
         * @param {string} eventName Event name.
         * @param {function} handler Handler function.
         */
        function addOneEventListener(eventName, handler) {
            listeners[eventName] = listeners[eventName] || [];
            listeners[eventName].push(handler);
            window.addEventListener(eventName, handler);
        }

        /**
         * Adds event listeners.
         * @param {object} listeners Listeners object.
         */
        function addEventListeners(listeners) {
            var eventName;
            for (eventName in listeners) {
                if (listeners.hasOwnProperty(eventName)) {
                    addOneEventListener(eventName, listeners[eventName]);
                }
            }
        }

        /**
         * Adds event listener for event name.
         * @memberof core/event
         *
         * @example
         * // Define `foo` module which handles event dispatched from `bar`
         * // with dispatchEvent method.
         * define({
         *     name: 'foo',
         *     requires: 'core/event',
         *     def: function def(ev) {
         *         // Add event listener
         *         ev.addEventListener('bar.test', function handler() {});
         *
         *         // or:
         *         // ev.on('bar.test', function handler() {});
         *         // ev.listen('bar.test', function handler() {});
         *         // ev.listeners('bar.test', function handler() {});
         *
         *         // Add event listeners using object:
         *         // ev.on({'bar.test': function handler() {}});
         *         // ev.listen({'bar.test': function handler() {}});
         *         // ev.listeners({'bar.test': function handler() {}});
         *         // ev.addEventListener({
         *         //     'bar.test': function handler() {},
         *         // });
         *     }
         * });
         *
         * @example
         * // Define `foo` module which handles event dispatched from `bar`
         * // with shoot method.
         * define({
         *     name: 'foo',
         *     requires: 'core/event',
         *     def: function def(ev) {
         *         // Add event listener
         *         ev.addEventListener('test', function handler() {});
         *
         *         // Or use available aliases for addEventListener
         * });
         * @see {@link core/event.dispatchEvent} How to fire event.
         *
         * @param {string|object} context Event name or Listeners object.
         * @param {function} [handler] Handler function.
         */
        function addEventListener(context, handler) {
            var contextType = typeof context;
            if (contextType === 'object') {
                addEventListeners(context);
            } else if (contextType === 'string') {
                addOneEventListener(context, handler);
            }
        }

        /**
         * Removes event listener.
         * @memberof core/event
         *
         * @param {string} eventName Event name.
         * @param {function} [handler] Handler function.
         */
        function removeEventListener(eventName, handler) {
            var i, handlerIndex, listenersLen;
            if (handler !== undefined) {
                // remove only this specific handler
                window.removeEventListener(eventName, handler);

                // find it in the array and clear the reference
                handlerIndex = listeners[eventName].indexOf(handler);
                if (handlerIndex !== -1) {
                    listeners[eventName].splice(handlerIndex, 1);
                }
            } else {
                // removes all listeners we know of
                listenersLen = listeners[eventName].length;
                for (i = 0; i < listenersLen; i += 1) {
                    window.removeEventListener(
                        eventName,
                        listeners[eventName][i]
                    );
                }
                // clear the references
                listeners[eventName] = [];
            }
        }

        return {

            shoot: shoot, // used only for backward compatibility

            addEventListener: addEventListener,

            /**
             * Alias for {@link core/event.addEventListener}
             * @memberof core/event
             * @function
             * @see {@link core/event.addEventListener}
             */
            listen: addEventListener,
            /**
             * Alias for {@link core/event.addEventListener}
             * @memberof core/event
             * @function
             * @see {@link core/event.addEventListener}
             */
            listeners: addEventListener,
            /**
             * Alias for {@link core/event.addEventListener}
             * @memberof core/event
             * @function
             * @see {@link core/event.addEventListener}
             */
            on: addEventListener,

            /**
             * Alias for {@link core/event.dispatchEvent}
             * @memberof core/event
             * @function
             * @see {@link core/event.dispatchEvent}
             */
            fire: dispatchEvent,
            dispatchEvent: dispatchEvent,

            /**
             * Alias for {@link core/event.removeEventListener}
             * @memberof core/event
             * @function
             * @see {@link core/event.removeEventListener}
             */
            die: removeEventListener,
            removeEventListener: removeEventListener,

            getListeners: getListeners
        };
    }
});
