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


/**
 * @namespace core
 * @author Sergiusz Struminski <s.struminski@samsung.com>
 * @author Pawel Sierszen <p.sierszen@samsung.com>
 */
(function core(global) {
    'use strict';

    /**
     * Public object.
     * @type {object}
     */
    var publicAPI = {},

        /**
         * Document element.
         * @type {object}
         */
        document = global.document,

        /**
         * Head element.
         * @type {HTMLHeadElement}
         */
        head = document.getElementsByTagName('head')[0],

        /**
         * Internal object cache
         * @type {object}
         */
        modules = {},

        /**
         * Internal config
         * @type {object}
         */
        cfg = {

            /**
             * Default path to modules.
             * @type {string}
             */
            defaultPath: './js/',

            /**
             * Path to core modules.
             * @type {string}
             */
            basePath: null,

            /**
             * Path to application modules.
             * @type {string}
             */
            modulePath: null
        };

    /**
     * Generic Module class.
     * @private
     */
    function Module(name) {
        // Module name.
        this.name = name;
        return;
    }

    /**
     * Returns correct path for modules.
     * @private
     * @param {string} data Current path.
     * @return {string} New path.
     */
    function getPath(data) {
        var index = data.lastIndexOf('/'),
            path = data.substr(0, index + 1);

        return path || './';
    }

    /**
     * Have all requires been sorted already?
     * @private
     * @param {string[]} requires Requires.
     * @param {string[]} sorted Sorted requires.
     * @return {boolean} result.
     */
    function areSorted(requires, sorted) {
        var i = 0,
            depsLen = requires.length,
            result = true;
        for (i = 0; i < depsLen; i += 1) {
            // Has mod been sorted already?
            result = result && (sorted.indexOf(requires[i]) !== -1);
        }
        return result;
    }

    /**
     * Sort modules by requires (dependents last),
     * returning sorted list of module names.
     * @private
     * @param {object} modules Modules.
     */
    function sort(modules) {

        var name = null,
            // Modules to be sorted.
            pending = [],
            // Modules already sorted.
            sorted = [],
            // Remember length of pending list for each module.
            visited = {},
            currModule = null;

        for (name in modules) {
            if (modules.hasOwnProperty(name)) {
                if (modules[name].instance) {
                    // Already linked.
                    sorted.push(name);
                } else {
                    // Sort for linking.
                    pending.push(name);
                }
            }
        }

        // Repeat while there are modules pending.
        while (pending.length > 0) {

            // Consider the next pending module
            currModule = pending.shift();

            // If we've been here and have not made any progress, we are looping
            // (no support for cyclic module requires).
            if (visited[currModule] && visited[currModule] <= pending.length) {
                throw new Error('No support for circular module dependency.');
            }
            visited[currModule] = pending.length;

            // Consider the current module's import requires.
            if (areSorted(modules[currModule].requires, sorted)) {
                // Requires done, module done.
                sorted.push(currModule);
            } else {
                // Some requires still pending.
                pending.push(currModule);
            }
        }

        return sorted;
    }

    /**
     * Merge the contents of two objects into the first object.
     * @private
     * @param {Object} target Target object (child).
     * @param {Object} source Source object (parent).
     * @return {Object} Target object.
     */
    function extend(target, source) {
        var prop = null;
        for (prop in source) {
            if (source.hasOwnProperty(prop)) {
                Object.defineProperty(
                    target,
                    prop,
                    {
                        value: source[prop]
                    }
                );
            }
        }
        return target;
    }

    /**
     * Create the object using Def as a constructor.
     * In this case the object inherits the prototype from Def.
     * @private
     * @param {function} Def Constructing function.
     * @param {object[]} args Parameters for the constructing function.
     * @return {object} Constructed object.
     */
    function construct(Def, args) {
        var argsLen = args.length;

        // Switch/case is used for performance reasons.
        switch (argsLen) {
        case 0:
            return new Def();
        case 1:
            return new Def(args[0]);
        case 2:
            return new Def(args[0], args[1]);
        case 3:
            return new Def(args[0], args[1], args[2]);
        case 4:
            return new Def(args[0], args[1], args[2], args[3]);
        case 5:
            return new Def(args[0], args[1], args[2], args[3], args[4]);
        default:
            // Too many parameters, use a short form instead
            return Def.apply(Object.create(Def.prototype), args);
        }
    }

    /**
     * Creates an object using the passed constructor and parameters.
     * @private
     * @param {function} Def Constructing function.
     * @param {object[]} args Parameters for the constructing function.
     * @return {object} Object of Def type.
     */
    function instantiate(Def, args) {
        var obj = null, proto = null;

        obj = construct(Def, args);

        // Constructors don't have to return anything, but we need at least
        // an empty object.
        if (!obj) {
            obj = {};
        }

        /**
         * If the module returns a plain object, we need to fix this.
         * Create an object with a valid prototype
         * and extend it by copying properties from the original object.
         * The previous prototype, if any, is ignored.
         * Only modules created with Object function will be extended.
         * It is for ignore global objects like "window" or "tizen".
         */
        proto = Object.getPrototypeOf(obj);
        if (proto !== null && !Object.prototype.isPrototypeOf(proto)) {
            obj = extend(
                Object.create(Def.prototype),
                obj
            );
        }

        return obj;
    }

    /**
     * Assigns nested attributes.
     * @private
     * @param {object} obj Object.
     * @param {string[]} pathElements Elements array.
     * @param {object} value Object.
     */
    function assignNested(obj, pathElements, value) {
        var i, key = pathElements.pop();
        // Check the path.
        for (i = 0; i < pathElements.length; i += 1) {
            // If empty create an empty object here.
            obj = obj[pathElements[i]] = obj[pathElements[i]] || {};
        }
        obj[key] = value;
    }

    /**
     * Returns required module instance.
     * Parameters are passed to the constructor.
     * @private
     * @param {string} moduleName Module name.
     * @param {object} reqModule Required module object.
     * @return {object} Module instance.
     */
    function requireInstance(moduleName, reqModule) {
        var instance = reqModule.instance;
        if (reqModule.name === 'core/event') {
            // Make new object inherited from core/event module
            // for adding additional properties (per caller module).
            instance = Object.create(reqModule.instance);
            // Module name used to fire events.
            instance.evName = moduleName.replace(/\//g, '.');
        }
        return instance;
    }

    /**
     * Creates parameters (from required modules).
     * Parameters are passed to the constructor.
     * @private
     * @param {object} module Module object.
     * @return {object[]} params.
     */
    function createParams(module) {
        var def = module.def,
            requires = module.requires,
            params = [],
            req = {},
            instance = null,
            i = 0;

        if (def.length === 1 && requires.length > 1) {
            // Collect requires as object.
            for (i = requires.length - 1; i >= 0; i -= 1) {
                instance = requireInstance(module.name, modules[requires[i]]);

                // Full name keys for array-like indexing.
                req[requires[i]] = instance;

                // Nested objects for cleaner syntax.
                assignNested(req, requires[i].split('/'), instance);
            }
            params.push(req);

        } else if (def.length === requires.length) {
            // Collect requires as modules.
            for (i = requires.length - 1; i >= 0; i -= 1) {
                params[i] = requireInstance(module.name, modules[requires[i]]);
            }

        } else if (def.length !== 0) {
            // Invalid number of params.
            // Definition module params length is greater than zero
            // and different than requires params length.
            throw new Error(
                'Invalid number of params in ' + def.name +
                    '- expected ' + requires.length + ' but is ' + def.length
            );
        }

        return params;
    }


    /**
     * Links and runs modules in the order in which they were loaded.
     * @private
     */
    function link() {
        var i = 0,
            sorted = [],
            sortedLen = 0,
            name = '',
            module = null;

        // Sort modules in requires order.
        sorted = sort(modules);
        sortedLen = sorted.length;

        // Create instances of modules in requires order.
        for (i = 0; i < sortedLen; i += 1) {
            name = sorted[i];
            module = modules[name];

            if (module.instance === undefined) {
                module.initialized = false;

                // Each module should inherit from a generic Module object.
                module.def.prototype = new Module(name);

                // Execute module code, pass requires, record exports.
                modules[name].instance = instantiate(
                    module.def,
                    createParams(module)
                );
            }
        }

        // Initialize modules in requires order.
        // It must be in different loop (see above)
        // because we need every instance ready.
        for (i = 0; i < sortedLen; i += 1) {
            name = sorted[i];
            module = modules[name];

            if (module.instance !== undefined && !module.initialized) {
                if (typeof modules[name].instance.init === 'function') {
                    modules[name].instance.init();
                    module.initialized = true;
                }
            }
        }

    }

    /**
     * Returns instance of module.
     * @global
     *
     * @example
     * // Define `foo` module which require `bar` module:
     * define({
     *     name: 'foo',
     *     requires: ['bar'],
     *     def: function def(bar) {}
     * });
     *
     * // Define `bar` module which needs some `foo` functionalities:
     * // You can't define a circular dependency
     * // (foo needs bar and bar needs foo)
     * define({
     *     name: 'bar',
     *     requires: ['foo'],
     *     def: function def(foo) {}
     * });
     *
     * // In that case use:
     * define({
     *     name: 'bar',
     *     def: function def() {
     *         var foo;
     *         function init() {
     *             foo = require('foo');
     *         }
     *         return {
     *             init: init
     *         }
     *     }
     * });
     *
     * @throws {Error} Module must be defined.
     * @throws {Error} Module must be an instance.
     *
     * @param {string} moduleName Module name.
     * @return {object} Module instance.
     */
    function require(moduleName) {
        var module = modules[moduleName];

        if (module === undefined) {
            throw new Error('Module ' + moduleName + ' must be defined.');
        }

        if (module.instance === undefined) {
            throw new Error('The instance of ' + moduleName +
                ' doesn\'t exist yet.');
        }

        return module.instance;
    }

    /**
     * Loads a script.
     * @private
     * @param {string} src Script src.
     */
    function loadScript(src) {
        var script = null;

        script = document.createElement('script');
        script.setAttribute('src', src);
        script.addEventListener('error', function error() {
            throw new Error(
                'Failed to load "' + src + '" script'
            );
        });
        head.appendChild(script);
    }

    /**
     * Loads a module.
     * @private
     * @param {string} moduleName Module name.
     */
    function load(moduleName) {
        var modulePath = '';

        if (modules[moduleName] !== undefined) {
            return false;
        }

        modules[moduleName] = {};

        if (moduleName.indexOf('core') === 0) {
            modulePath = cfg.basePath || cfg.defaultPath;
        } else {
            modulePath = cfg.modulePath || cfg.defaultPath;
        }

        loadScript(modulePath + moduleName + '.js');

        return true;
    }

    /**
     * Check whether this was the last module to be loaded
     * in a given dependency group.
     * If yes, start linking and running modules.
     * @private
     */
    function loaded() {
        var m = null,
            pending = [];

        for (m in modules) {
            if (modules.hasOwnProperty(m) && modules[m].name === undefined) {
                pending.push(m);
            }
        }

        if (pending.length === 0) {
            link();
        }
    }

    /**
     * The function that handles definitions of modules.
     * @global
     *
     * @example
     * // Define `foo` module:
     * define({
     *     name: 'foo',
     *     def: function def() {}
     * });
     *
     * @example
     * // Define `bar` module:
     * define({
     *     name: 'bar',
     *     def: function def() {}
     * });
     *
     * @example
     * // Define `foo` module which require `bar` module:
     * define({
     *     name: 'foo',
     *     requires: ['bar'],
     *     def: function def(bar) {}
     * });
     *
     * @example
     * // Define `foo` module which require `bar1` and `bar2` module:
     * define({
     *     name: 'foo',
     *     requires: ['bar1', 'bar2'],
     *     def: function def(bar1, bar2) {}
     * });
     *
     * @example
     * // Define `foo` module which require `bar1` and `bar2` module:
     * define({
     *     name: 'foo',
     *     requires: ['bar1', 'bar2'],
     *     def: function def(require) {
     *         var bar1 = require.bar1,
     *             bar2 = require.bar2;
     *     }
     * });
     *
     * @example
     * // Define `foo` module which require `path/bar1` and `path/bar2` module:
     * define({
     *     name: 'foo',
     *     requires: ['path/bar1', 'path/bar2'],
     *     def: function def(require) {
     *         // recommended
     *         var bar1 = require.path.bar1,
     *             bar2 = require.path.bar2;
     *         // or
     *         var bar1 = require['path/bar1'],
     *             bar2 = require['path/bar2'];
     *     }
     * });
     *
     * @example
     * // Define `foo` module which is automatically initialized
     * // during definition:
     * define({
     *     name: 'foo',
     *     def: function def() {
     *         // module definition
     *         function init() {
     *             // init action
     *         }
     *
     *         // return the module value with init function
     *         return {
     *             init: init
     *         };
     *     }
     * });
     *
     * @throws {Error} Module must have name and definition.
     * @throws {Error} Module is already defined.
     *
     * @param {object} module Module object.
     * @param {string} module.name Module name.
     * @param {string[]} [module.requires] Module requires.
     * @param {function} module.def Module definition.
     */
    function define(module) {
        var i = 0,
            j = 0;

        module = module || {};

        if (module.name === undefined || module.def === undefined) {
            throw new Error(
                'Module must have name and definition'
            );
        }

        if (modules[module.name] !== undefined &&
                modules[module.name].name !== undefined) {
            throw new Error(
                'Module "' + module.name + '" is already defined'
            );
        }

        module.requires = module.requires || [];
        modules[module.name] = module;

        // Load required modules.
        for (i = 0, j = module.requires.length; i < j; i += 1) {
            load(module.requires[i]);
        }

        // Check for loaded modules.
        loaded();

        return true;
    }

    /**
     * Looks for a data-main attribute in script elements.
     * Data-main attribute tells core to load main application script.
     * @private
     * @return {boolean}
     */
    function main() {
        var i = 0,
            len = 0,
            scripts = document.getElementsByTagName('script'),
            script = null,
            dataMain = null;

        for (i = 0, len = scripts.length; i < len; i += 1) {
            script = scripts[i];
            dataMain = script.getAttribute('data-main');
            if (dataMain) {
                cfg.modulePath = getPath(dataMain);
                cfg.basePath = getPath(script.getAttribute('src'));
                loadScript(dataMain);
                return true;
            }
        }
        return true;
    }

    publicAPI = {
        require: require,
        define: define
    };

    extend(global, publicAPI);

    main();

}(this));
