'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SPLIT_PATTERN = /\s+/;

var Events = function () {
    function Events() {
        (0, _classCallCheck3.default)(this, Events);
    }

    (0, _createClass3.default)(Events, [{
        key: 'on',
        value: function on(eventNames, callback, ctx) {
            var cache = void 0,
                eventName = void 0;

            if (callback) {
                cache = this.__events || (this.__events = {});
                eventNames = eventNames.split(SPLIT_PATTERN);

                while (eventName = eventNames.shift()) {
                    (cache[eventName] || (cache[eventName] = [])).push(callback, ctx);
                }
            }

            return this;
        }
    }, {
        key: 'once',
        value: function once(eventNames, callback, ctx) {
            var that = this;

            function cb() {
                that.off(eventNames, cb);
                callback.apply(ctx || that, arguments);
            }

            return this.on(eventNames, cb, ctx);
        }
    }, {
        key: 'off',
        value: function off(eventNames, callback, ctx) {
            var index = void 0,
                cache = void 0,
                eventName = void 0,
                list = void 0;

            if (cache = this.__events) {
                if (arguments.length === 0) {
                    delete this.__events;
                } else {
                    eventNames = eventNames.split(SPLIT_PATTERN);

                    while (eventName = eventNames.shift()) {
                        if (!(list = cache[eventName])) {
                            continue;
                        }

                        if (!(callback || ctx)) {
                            delete cache[eventName];
                            continue;
                        }

                        for (index = list.length - 2; index >= 0; index -= 2) {
                            if (callback && list[index] === callback || ctx && list[index + 1] === ctx) {
                                list.splice(index, 2);
                            }
                        }
                    }
                }
            }

            return this;
        }
    }, {
        key: 'emit',
        value: function emit(eventNames) {
            var index = void 0,
                len = void 0,
                list = void 0,
                args = void 0,
                returned = void 0,
                eventName = void 0,
                cache = void 0;

            args = [];
            returned = true;

            if (!(cache = this.__events)) {
                return this;
            }

            eventNames = eventNames.split(SPLIT_PATTERN);

            for (index = 1, len = arguments.length; index < len; index++) {
                args[index - 1] = arguments[index];
            }

            while (eventName = eventNames.shift()) {
                if (list = cache[eventName]) {
                    returned = callEach(list.slice(), args, this) && returned;
                }
            }

            return returned;
        }
    }]);
    return Events;
}();

function callEach(list, args, ctx) {
    var i = void 0,
        len = void 0,
        a1 = void 0,
        a2 = void 0,
        a3 = void 0,
        pass = void 0;

    i = 0;
    pass = true;
    a1 = args[0];
    a2 = args[1];
    a3 = args[2];
    len = list.length;

    switch (args.length) {
        case 0:
            for (; i < len; i += 2) {
                pass = list[i].call(list[i + 1] || ctx) !== false && pass;
            }
            break;
        case 1:
            for (; i < len; i += 2) {
                pass = list[i].call(list[i + 1] || ctx, a1) !== false && pass;
            }
            break;
        case 2:
            for (; i < len; i += 2) {
                pass = list[i].call(list[i + 1] || ctx, a1, a2) !== false && pass;
            }
            break;
        case 3:
            for (; i < len; i += 2) {
                pass = list[i].call(list[i + 1] || ctx, a1, a2, a3) !== false && pass;
            }
            break;
        default:
            for (; i < len; i += 2) {
                pass = list[i].apply(list[i + 1] || ctx, args) !== false && pass;
            }
            break;
    }

    return pass;
}

function plugin(Vue, opts) {
    var eventHub = new Events();

    Vue.eventHub = eventHub;
    Vue.prototype.$eventHub = eventHub;
}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(plugin);
}

exports.default = plugin;