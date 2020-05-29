
# Overview #

Reference Web Applications Core uses a simple MVP (Model View Presenter) architecture.

There are a core part which determines the architecture and an app part which determines the application behavior.


# Overview of core.js #

`core.js` implements simple AMD (Asynchronous Module Definition) and specifies module defining.

Modules definition organizes code into simple units (modules).
Module can refer to other modules – dependency references.


## Loading ##

`core.js` loads files with a different approach than &lt;script&gt; tags in HTML file.

`core.js` loads each file as a script tag, using _document.createElement_ and _head.appendChild_ and then waits for all dependencies to load, figures the right order to call definitions of module.

## Usage ##

Adding `core.js` to index.html:
```
{@lang xml}<script src="./js/libs/core/core.js" data-main="./js/app.js"></script>
```


Where `app.js` is the main application module.

```
{@lang javascript}define({
    name: 'app',
    def: function def() {}
});
```

### Defining a module ###
A module is a file with simple code unit, different from a traditional script file. Module avoids impact on global namespace like _window_.
Any valid return from a module is allowed, module can return objects, functions or nothing. If module definition return object with
_init_ method then module will be automatically initialized.
There should only be __one__ module definition per file.

[See examples how to define a module](global.html#define)


# Contributors #

* [Sergiusz Struminski](mailto:s.struminski@samsung.com)
* [Pawel Sierszen](mailto:p.sierszen@samsung.com)
* [Kamil Stepczuk](mailto:k.stepczuk@samsung.com)
