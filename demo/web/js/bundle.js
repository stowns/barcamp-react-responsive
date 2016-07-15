(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * 'Higher Order Component' that controls the props of a wrapped
 * component via stores.
 *
 * Expects the Component to have two static methods:
 *   - getStores(): Should return an array of stores.
 *   - getPropsFromStores(props): Should return the props from the stores.
 *
 * Example using old React.createClass() style:
 *
 *    const MyComponent = React.createClass({
 *      statics: {
 *        getStores(props) {
 *          return [myStore]
 *        },
 *        getPropsFromStores(props) {
 *          return myStore.getState()
 *        }
 *      },
 *      render() {
 *        // Use this.props like normal ...
 *      }
 *    })
 *    MyComponent = connectToStores(MyComponent)
 *
 *
 * Example using ES6 Class:
 *
 *    class MyComponent extends React.Component {
 *      static getStores(props) {
 *        return [myStore]
 *      }
 *      static getPropsFromStores(props) {
 *        return myStore.getState()
 *      }
 *      render() {
 *        // Use this.props like normal ...
 *      }
 *    }
 *    MyComponent = connectToStores(MyComponent)
 *
 * A great explanation of the merits of higher order components can be found at
 * http://bit.ly/1abPkrP
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _functions = require('./functions');

function connectToStores(Spec) {
  var Component = arguments.length <= 1 || arguments[1] === undefined ? Spec : arguments[1];
  return (function () {
    // Check for required static methods.
    if (!(0, _functions.isFunction)(Spec.getStores)) {
      throw new Error('connectToStores() expects the wrapped component to have a static getStores() method');
    }
    if (!(0, _functions.isFunction)(Spec.getPropsFromStores)) {
      throw new Error('connectToStores() expects the wrapped component to have a static getPropsFromStores() method');
    }

    var StoreConnection = _react2['default'].createClass({
      displayName: 'Stateful' + (Component.displayName || Component.name || 'Container'),

      getInitialState: function getInitialState() {
        return Spec.getPropsFromStores(this.props, this.context);
      },

      componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        this.setState(Spec.getPropsFromStores(nextProps, this.context));
      },

      componentDidMount: function componentDidMount() {
        var _this = this;

        var stores = Spec.getStores(this.props, this.context);
        this.storeListeners = stores.map(function (store) {
          return store.listen(_this.onChange);
        });
        if (Spec.componentDidConnect) {
          Spec.componentDidConnect(this.props, this.context);
        }
      },

      componentWillUnmount: function componentWillUnmount() {
        this.storeListeners.forEach(function (unlisten) {
          return unlisten();
        });
      },

      onChange: function onChange() {
        this.setState(Spec.getPropsFromStores(this.props, this.context));
      },

      render: function render() {
        return _react2['default'].createElement(Component, (0, _functions.assign)({}, this.props, this.state));
      }
    });
    if (Component.contextTypes) {
      StoreConnection.contextTypes = Component.contextTypes;
    }

    return StoreConnection;
  })();
}

exports['default'] = connectToStores;
module.exports = exports['default'];
},{"./functions":2,"react":"react"}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isPojo = isPojo;
exports.isPromise = isPromise;
exports.eachObject = eachObject;
exports.assign = assign;
var isFunction = function isFunction(x) {
  return typeof x === 'function';
};

exports.isFunction = isFunction;

function isPojo(target) {
  var Ctor = target.constructor;

  return !!target && typeof target === 'object' && Object.prototype.toString.call(target) === '[object Object]' && isFunction(Ctor) && (Ctor instanceof Ctor || target.type === 'AltStore');
}

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

function eachObject(f, o) {
  o.forEach(function (from) {
    Object.keys(Object(from)).forEach(function (key) {
      f(key, from[key]);
    });
  });
}

function assign(target) {
  for (var _len = arguments.length, source = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    source[_key - 1] = arguments[_key];
  }

  eachObject(function (key, value) {
    return target[key] = value;
  }, source);
  return target;
}
},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports['default'] = makeAction;

var _functions = require('../functions');

var fn = _interopRequireWildcard(_functions);

var _AltUtils = require('../utils/AltUtils');

var utils = _interopRequireWildcard(_AltUtils);

var _isPromise = require('is-promise');

var _isPromise2 = _interopRequireDefault(_isPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function makeAction(alt, namespace, name, implementation, obj) {
  var id = utils.uid(alt._actionsRegistry, String(namespace) + '.' + String(name));
  alt._actionsRegistry[id] = 1;

  var data = { id: id, namespace: namespace, name: name };

  var dispatch = function dispatch(payload) {
    return alt.dispatch(id, payload, data);
  };

  // the action itself
  var action = function action() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var invocationResult = implementation.apply(obj, args);
    var actionResult = invocationResult;

    // async functions that return promises should not be dispatched
    if (invocationResult !== undefined && !(0, _isPromise2.default)(invocationResult)) {
      if (fn.isFunction(invocationResult)) {
        // inner function result should be returned as an action result
        actionResult = invocationResult(dispatch, alt);
      } else {
        dispatch(invocationResult);
      }
    }

    if (invocationResult === undefined) {
      utils.warn('An action was called but nothing was dispatched');
    }

    return actionResult;
  };
  action.defer = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return setTimeout(function () {
      return action.apply(null, args);
    });
  };
  action.id = id;
  action.data = data;

  // ensure each reference is unique in the namespace
  var container = alt.actions[namespace];
  var namespaceId = utils.uid(container, name);
  container[namespaceId] = action;

  // generate a constant
  var constant = utils.formatAsConstant(namespaceId);
  container[constant] = id;

  return action;
}
module.exports = exports['default'];
},{"../functions":4,"../utils/AltUtils":9,"is-promise":14}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMutableObject = isMutableObject;
exports.eachObject = eachObject;
exports.assign = assign;
var isFunction = exports.isFunction = function isFunction(x) {
  return typeof x === 'function';
};

function isMutableObject(target) {
  var Ctor = target.constructor;

  return !!target && Object.prototype.toString.call(target) === '[object Object]' && isFunction(Ctor) && !Object.isFrozen(target) && (Ctor instanceof Ctor || target.type === 'AltStore');
}

function eachObject(f, o) {
  o.forEach(function (from) {
    Object.keys(Object(from)).forEach(function (key) {
      f(key, from[key]);
    });
  });
}

function assign(target) {
  for (var _len = arguments.length, source = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    source[_key - 1] = arguments[_key];
  }

  eachObject(function (key, value) {
    return target[key] = value;
  }, source);
  return target;
}
},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _flux = require('flux');

var _StateFunctions = require('./utils/StateFunctions');

var StateFunctions = _interopRequireWildcard(_StateFunctions);

var _functions = require('./functions');

var fn = _interopRequireWildcard(_functions);

var _store = require('./store');

var store = _interopRequireWildcard(_store);

var _AltUtils = require('./utils/AltUtils');

var utils = _interopRequireWildcard(_AltUtils);

var _actions = require('./actions');

var _actions2 = _interopRequireDefault(_actions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /* global window */


var Alt = function () {
  function Alt() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Alt);

    this.config = config;
    this.serialize = config.serialize || JSON.stringify;
    this.deserialize = config.deserialize || JSON.parse;
    this.dispatcher = config.dispatcher || new _flux.Dispatcher();
    this.batchingFunction = config.batchingFunction || function (callback) {
      return callback();
    };
    this.actions = { global: {} };
    this.stores = {};
    this.storeTransforms = config.storeTransforms || [];
    this.trapAsync = false;
    this._actionsRegistry = {};
    this._initSnapshot = {};
    this._lastSnapshot = {};
  }

  Alt.prototype.dispatch = function () {
    function dispatch(action, data, details) {
      var _this = this;

      this.batchingFunction(function () {
        var id = Math.random().toString(18).substr(2, 16);

        // support straight dispatching of FSA-style actions
        if (action.hasOwnProperty('type') && action.hasOwnProperty('payload')) {
          var fsaDetails = {
            id: action.type,
            namespace: action.type,
            name: action.type
          };
          return _this.dispatcher.dispatch(utils.fsa(id, action.type, action.payload, fsaDetails));
        }

        if (action.id && action.dispatch) {
          return utils.dispatch(id, action, data, _this);
        }

        return _this.dispatcher.dispatch(utils.fsa(id, action, data, details));
      });
    }

    return dispatch;
  }();

  Alt.prototype.createUnsavedStore = function () {
    function createUnsavedStore(StoreModel) {
      var key = StoreModel.displayName || '';
      store.createStoreConfig(this.config, StoreModel);
      var Store = store.transformStore(this.storeTransforms, StoreModel);

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return fn.isFunction(Store) ? store.createStoreFromClass.apply(store, [this, Store, key].concat(args)) : store.createStoreFromObject(this, Store, key);
    }

    return createUnsavedStore;
  }();

  Alt.prototype.createStore = function () {
    function createStore(StoreModel, iden) {
      var key = iden || StoreModel.displayName || StoreModel.name || '';
      store.createStoreConfig(this.config, StoreModel);
      var Store = store.transformStore(this.storeTransforms, StoreModel);

      /* istanbul ignore next */
      if (module.hot) delete this.stores[key];

      if (this.stores[key] || !key) {
        if (this.stores[key]) {
          utils.warn('A store named ' + String(key) + ' already exists, double check your store ' + 'names or pass in your own custom identifier for each store');
        } else {
          utils.warn('Store name was not specified');
        }

        key = utils.uid(this.stores, key);
      }

      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      var storeInstance = fn.isFunction(Store) ? store.createStoreFromClass.apply(store, [this, Store, key].concat(args)) : store.createStoreFromObject(this, Store, key);

      this.stores[key] = storeInstance;
      StateFunctions.saveInitialSnapshot(this, key);

      return storeInstance;
    }

    return createStore;
  }();

  Alt.prototype.generateActions = function () {
    function generateActions() {
      var actions = { name: 'global' };

      for (var _len3 = arguments.length, actionNames = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        actionNames[_key3] = arguments[_key3];
      }

      return this.createActions(actionNames.reduce(function (obj, action) {
        obj[action] = utils.dispatchIdentity;
        return obj;
      }, actions));
    }

    return generateActions;
  }();

  Alt.prototype.createAction = function () {
    function createAction(name, implementation, obj) {
      return (0, _actions2.default)(this, 'global', name, implementation, obj);
    }

    return createAction;
  }();

  Alt.prototype.createActions = function () {
    function createActions(ActionsClass) {
      var _this3 = this;

      var exportObj = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var actions = {};
      var key = utils.uid(this._actionsRegistry, ActionsClass.displayName || ActionsClass.name || 'Unknown');

      if (fn.isFunction(ActionsClass)) {
        fn.assign(actions, utils.getPrototypeChain(ActionsClass));

        var ActionsGenerator = function (_ActionsClass) {
          _inherits(ActionsGenerator, _ActionsClass);

          function ActionsGenerator() {
            _classCallCheck(this, ActionsGenerator);

            for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
              args[_key5] = arguments[_key5];
            }

            return _possibleConstructorReturn(this, _ActionsClass.call.apply(_ActionsClass, [this].concat(args)));
          }

          ActionsGenerator.prototype.generateActions = function () {
            function generateActions() {
              for (var _len6 = arguments.length, actionNames = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                actionNames[_key6] = arguments[_key6];
              }

              actionNames.forEach(function (actionName) {
                actions[actionName] = utils.dispatchIdentity;
              });
            }

            return generateActions;
          }();

          return ActionsGenerator;
        }(ActionsClass);

        for (var _len4 = arguments.length, argsForConstructor = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
          argsForConstructor[_key4 - 2] = arguments[_key4];
        }

        fn.assign(actions, new (Function.prototype.bind.apply(ActionsGenerator, [null].concat(argsForConstructor)))());
      } else {
        fn.assign(actions, ActionsClass);
      }

      this.actions[key] = this.actions[key] || {};

      fn.eachObject(function (actionName, action) {
        if (!fn.isFunction(action)) {
          exportObj[actionName] = action;
          return;
        }

        // create the action
        exportObj[actionName] = (0, _actions2.default)(_this3, key, actionName, action, exportObj);

        // generate a constant
        var constant = utils.formatAsConstant(actionName);
        exportObj[constant] = exportObj[actionName].id;
      }, [actions]);

      return exportObj;
    }

    return createActions;
  }();

  Alt.prototype.takeSnapshot = function () {
    function takeSnapshot() {
      for (var _len7 = arguments.length, storeNames = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        storeNames[_key7] = arguments[_key7];
      }

      var state = StateFunctions.snapshot(this, storeNames);
      fn.assign(this._lastSnapshot, state);
      return this.serialize(state);
    }

    return takeSnapshot;
  }();

  Alt.prototype.rollback = function () {
    function rollback() {
      StateFunctions.setAppState(this, this.serialize(this._lastSnapshot), function (storeInst) {
        storeInst.lifecycle('rollback');
        storeInst.emitChange();
      });
    }

    return rollback;
  }();

  Alt.prototype.recycle = function () {
    function recycle() {
      for (var _len8 = arguments.length, storeNames = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        storeNames[_key8] = arguments[_key8];
      }

      var initialSnapshot = storeNames.length ? StateFunctions.filterSnapshots(this, this._initSnapshot, storeNames) : this._initSnapshot;

      StateFunctions.setAppState(this, this.serialize(initialSnapshot), function (storeInst) {
        storeInst.lifecycle('init');
        storeInst.emitChange();
      });
    }

    return recycle;
  }();

  Alt.prototype.flush = function () {
    function flush() {
      var state = this.serialize(StateFunctions.snapshot(this));
      this.recycle();
      return state;
    }

    return flush;
  }();

  Alt.prototype.bootstrap = function () {
    function bootstrap(data) {
      StateFunctions.setAppState(this, data, function (storeInst, state) {
        storeInst.lifecycle('bootstrap', state);
        storeInst.emitChange();
      });
    }

    return bootstrap;
  }();

  Alt.prototype.prepare = function () {
    function prepare(storeInst, payload) {
      var data = {};
      if (!storeInst.displayName) {
        throw new ReferenceError('Store provided does not have a name');
      }
      data[storeInst.displayName] = payload;
      return this.serialize(data);
    }

    return prepare;
  }();

  // Instance type methods for injecting alt into your application as context

  Alt.prototype.addActions = function () {
    function addActions(name, ActionsClass) {
      for (var _len9 = arguments.length, args = Array(_len9 > 2 ? _len9 - 2 : 0), _key9 = 2; _key9 < _len9; _key9++) {
        args[_key9 - 2] = arguments[_key9];
      }

      this.actions[name] = Array.isArray(ActionsClass) ? this.generateActions.apply(this, ActionsClass) : this.createActions.apply(this, [ActionsClass].concat(args));
    }

    return addActions;
  }();

  Alt.prototype.addStore = function () {
    function addStore(name, StoreModel) {
      for (var _len10 = arguments.length, args = Array(_len10 > 2 ? _len10 - 2 : 0), _key10 = 2; _key10 < _len10; _key10++) {
        args[_key10 - 2] = arguments[_key10];
      }

      this.createStore.apply(this, [StoreModel, name].concat(args));
    }

    return addStore;
  }();

  Alt.prototype.getActions = function () {
    function getActions(name) {
      return this.actions[name];
    }

    return getActions;
  }();

  Alt.prototype.getStore = function () {
    function getStore(name) {
      return this.stores[name];
    }

    return getStore;
  }();

  Alt.debug = function () {
    function debug(name, alt, win) {
      var key = 'alt.js.org';
      var context = win;
      if (!context && typeof window !== 'undefined') {
        context = window;
      }
      if (typeof context !== 'undefined') {
        context[key] = context[key] || [];
        context[key].push({ name: name, alt: alt });
      }
      return alt;
    }

    return debug;
  }();

  return Alt;
}();

exports.default = Alt;
module.exports = exports['default'];
},{"./actions":3,"./functions":4,"./store":8,"./utils/AltUtils":9,"./utils/StateFunctions":10,"flux":12}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _functions = require('../functions');

var fn = _interopRequireWildcard(_functions);

var _transmitter = require('transmitter');

var _transmitter2 = _interopRequireDefault(_transmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AltStore = function () {
  function AltStore(alt, model, state, StoreModel) {
    var _this = this;

    _classCallCheck(this, AltStore);

    var lifecycleEvents = model.lifecycleEvents;
    this.transmitter = (0, _transmitter2.default)();
    this.lifecycle = function (event, x) {
      if (lifecycleEvents[event]) lifecycleEvents[event].push(x);
    };
    this.state = state;

    this.alt = alt;
    this.preventDefault = false;
    this.displayName = model.displayName;
    this.boundListeners = model.boundListeners;
    this.StoreModel = StoreModel;
    this.reduce = model.reduce || function (x) {
      return x;
    };

    var output = model.output || function (x) {
      return x;
    };

    this.emitChange = function () {
      return _this.transmitter.push(output(_this.state));
    };

    var handleDispatch = function handleDispatch(f, payload) {
      try {
        return f();
      } catch (e) {
        if (model.handlesOwnErrors) {
          _this.lifecycle('error', {
            error: e,
            payload: payload,
            state: _this.state
          });
          return false;
        }

        throw e;
      }
    };

    fn.assign(this, model.publicMethods);

    // Register dispatcher
    this.dispatchToken = alt.dispatcher.register(function (payload) {
      _this.preventDefault = false;

      _this.lifecycle('beforeEach', {
        payload: payload,
        state: _this.state
      });

      var actionHandlers = model.actionListeners[payload.action];

      if (actionHandlers || model.otherwise) {
        var result = void 0;

        if (actionHandlers) {
          result = handleDispatch(function () {
            return actionHandlers.filter(Boolean).every(function (handler) {
              return handler.call(model, payload.data, payload.action) !== false;
            });
          }, payload);
        } else {
          result = handleDispatch(function () {
            return model.otherwise(payload.data, payload.action);
          }, payload);
        }

        if (result !== false && !_this.preventDefault) _this.emitChange();
      }

      if (model.reduce) {
        handleDispatch(function () {
          var value = model.reduce(_this.state, payload);
          if (value !== undefined) _this.state = value;
        }, payload);
        if (!_this.preventDefault) _this.emitChange();
      }

      _this.lifecycle('afterEach', {
        payload: payload,
        state: _this.state
      });
    });

    this.lifecycle('init');
  }

  AltStore.prototype.listen = function () {
    function listen(cb) {
      var _this2 = this;

      if (!fn.isFunction(cb)) throw new TypeError('listen expects a function');
      this.transmitter.subscribe(cb);
      return function () {
        return _this2.unlisten(cb);
      };
    }

    return listen;
  }();

  AltStore.prototype.unlisten = function () {
    function unlisten(cb) {
      this.lifecycle('unlisten');
      this.transmitter.unsubscribe(cb);
    }

    return unlisten;
  }();

  AltStore.prototype.getState = function () {
    function getState() {
      return this.StoreModel.config.getState.call(this, this.state);
    }

    return getState;
  }();

  return AltStore;
}();

exports.default = AltStore;
module.exports = exports['default'];
},{"../functions":4,"transmitter":16}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _transmitter = require('transmitter');

var _transmitter2 = _interopRequireDefault(_transmitter);

var _functions = require('../functions');

var fn = _interopRequireWildcard(_functions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var StoreMixin = {
  waitFor: function () {
    function waitFor() {
      for (var _len = arguments.length, sources = Array(_len), _key = 0; _key < _len; _key++) {
        sources[_key] = arguments[_key];
      }

      if (!sources.length) {
        throw new ReferenceError('Dispatch tokens not provided');
      }

      var sourcesArray = sources;
      if (sources.length === 1) {
        sourcesArray = Array.isArray(sources[0]) ? sources[0] : sources;
      }

      var tokens = sourcesArray.map(function (source) {
        return source.dispatchToken || source;
      });

      this.dispatcher.waitFor(tokens);
    }

    return waitFor;
  }(),
  exportAsync: function () {
    function exportAsync(asyncMethods) {
      this.registerAsync(asyncMethods);
    }

    return exportAsync;
  }(),
  registerAsync: function () {
    function registerAsync(asyncDef) {
      var _this = this;

      var loadCounter = 0;

      var asyncMethods = fn.isFunction(asyncDef) ? asyncDef(this.alt) : asyncDef;

      var toExport = Object.keys(asyncMethods).reduce(function (publicMethods, methodName) {
        var desc = asyncMethods[methodName];
        var spec = fn.isFunction(desc) ? desc(_this) : desc;

        var validHandlers = ['success', 'error', 'loading'];
        validHandlers.forEach(function (handler) {
          if (spec[handler] && !spec[handler].id) {
            throw new Error(String(handler) + ' handler must be an action function');
          }
        });

        publicMethods[methodName] = function () {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          var state = _this.getInstance().getState();
          var value = spec.local && spec.local.apply(spec, [state].concat(args));
          var shouldFetch = spec.shouldFetch ? spec.shouldFetch.apply(spec, [state].concat(args))
          /*eslint-disable*/
          : value == null;
          /*eslint-enable*/
          var intercept = spec.interceptResponse || function (x) {
            return x;
          };

          var makeActionHandler = function () {
            function makeActionHandler(action, isError) {
              return function (x) {
                var fire = function () {
                  function fire() {
                    loadCounter -= 1;
                    action(intercept(x, action, args));
                    if (isError) throw x;
                  }

                  return fire;
                }();
                return _this.alt.trapAsync ? function () {
                  return fire();
                } : fire();
              };
            }

            return makeActionHandler;
          }();

          // if we don't have it in cache then fetch it
          if (shouldFetch) {
            loadCounter += 1;
            /* istanbul ignore else */
            if (spec.loading) spec.loading(intercept(null, spec.loading, args));
            return spec.remote.apply(spec, [state].concat(args)).then(makeActionHandler(spec.success), makeActionHandler(spec.error, 1));
          }

          // otherwise emit the change now
          _this.emitChange();
          return value;
        };

        return publicMethods;
      }, {});

      this.exportPublicMethods(toExport);
      this.exportPublicMethods({
        isLoading: function () {
          function isLoading() {
            return loadCounter > 0;
          }

          return isLoading;
        }()
      });
    }

    return registerAsync;
  }(),
  exportPublicMethods: function () {
    function exportPublicMethods(methods) {
      var _this2 = this;

      fn.eachObject(function (methodName, value) {
        if (!fn.isFunction(value)) {
          throw new TypeError('exportPublicMethods expects a function');
        }

        _this2.publicMethods[methodName] = value;
      }, [methods]);
    }

    return exportPublicMethods;
  }(),
  emitChange: function () {
    function emitChange() {
      this.getInstance().emitChange();
    }

    return emitChange;
  }(),
  on: function () {
    function on(lifecycleEvent, handler) {
      if (lifecycleEvent === 'error') this.handlesOwnErrors = true;
      var bus = this.lifecycleEvents[lifecycleEvent] || (0, _transmitter2.default)();
      this.lifecycleEvents[lifecycleEvent] = bus;
      return bus.subscribe(handler.bind(this));
    }

    return on;
  }(),
  bindAction: function () {
    function bindAction(symbol, handler) {
      if (!symbol) {
        throw new ReferenceError('Invalid action reference passed in');
      }
      if (!fn.isFunction(handler)) {
        throw new TypeError('bindAction expects a function');
      }

      // You can pass in the constant or the function itself
      var key = symbol.id ? symbol.id : symbol;
      this.actionListeners[key] = this.actionListeners[key] || [];
      this.actionListeners[key].push(handler.bind(this));
      this.boundListeners.push(key);
    }

    return bindAction;
  }(),
  bindActions: function () {
    function bindActions(actions) {
      var _this3 = this;

      fn.eachObject(function (action, symbol) {
        var matchFirstCharacter = /./;
        var assumedEventHandler = action.replace(matchFirstCharacter, function (x) {
          return 'on' + String(x[0].toUpperCase());
        });

        if (_this3[action] && _this3[assumedEventHandler]) {
          // If you have both action and onAction
          throw new ReferenceError('You have multiple action handlers bound to an action: ' + (String(action) + ' and ' + String(assumedEventHandler)));
        }

        var handler = _this3[action] || _this3[assumedEventHandler];
        if (handler) {
          _this3.bindAction(symbol, handler);
        }
      }, [actions]);
    }

    return bindActions;
  }(),
  bindListeners: function () {
    function bindListeners(obj) {
      var _this4 = this;

      fn.eachObject(function (methodName, symbol) {
        var listener = _this4[methodName];

        if (!listener) {
          throw new ReferenceError(String(methodName) + ' defined but does not exist in ' + String(_this4.displayName));
        }

        if (Array.isArray(symbol)) {
          symbol.forEach(function (action) {
            _this4.bindAction(action, listener);
          });
        } else {
          _this4.bindAction(symbol, listener);
        }
      }, [obj]);
    }

    return bindListeners;
  }()
};

exports.default = StoreMixin;
module.exports = exports['default'];
},{"../functions":4,"transmitter":16}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStoreConfig = createStoreConfig;
exports.transformStore = transformStore;
exports.createStoreFromObject = createStoreFromObject;
exports.createStoreFromClass = createStoreFromClass;

var _AltUtils = require('../utils/AltUtils');

var utils = _interopRequireWildcard(_AltUtils);

var _functions = require('../functions');

var fn = _interopRequireWildcard(_functions);

var _AltStore = require('./AltStore');

var _AltStore2 = _interopRequireDefault(_AltStore);

var _StoreMixin = require('./StoreMixin');

var _StoreMixin2 = _interopRequireDefault(_StoreMixin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function doSetState(store, storeInstance, state) {
  if (!state) {
    return;
  }

  var config = storeInstance.StoreModel.config;


  var nextState = fn.isFunction(state) ? state(storeInstance.state) : state;

  storeInstance.state = config.setState.call(store, storeInstance.state, nextState);

  if (!store.alt.dispatcher.isDispatching()) {
    store.emitChange();
  }
}

function createPrototype(proto, alt, key, extras) {
  return fn.assign(proto, _StoreMixin2.default, {
    displayName: key,
    alt: alt,
    dispatcher: alt.dispatcher,
    preventDefault: function () {
      function preventDefault() {
        this.getInstance().preventDefault = true;
      }

      return preventDefault;
    }(),

    boundListeners: [],
    lifecycleEvents: {},
    actionListeners: {},
    publicMethods: {},
    handlesOwnErrors: false
  }, extras);
}

function createStoreConfig(globalConfig, StoreModel) {
  StoreModel.config = fn.assign({
    getState: function () {
      function getState(state) {
        if (Array.isArray(state)) {
          return state.slice();
        } else if (fn.isMutableObject(state)) {
          return fn.assign({}, state);
        }

        return state;
      }

      return getState;
    }(),
    setState: function () {
      function setState(currentState, nextState) {
        if (fn.isMutableObject(nextState)) {
          return fn.assign(currentState, nextState);
        }
        return nextState;
      }

      return setState;
    }()
  }, globalConfig, StoreModel.config);
}

function transformStore(transforms, StoreModel) {
  return transforms.reduce(function (Store, transform) {
    return transform(Store);
  }, StoreModel);
}

function createStoreFromObject(alt, StoreModel, key) {
  var storeInstance = void 0;

  var StoreProto = createPrototype({}, alt, key, fn.assign({
    getInstance: function () {
      function getInstance() {
        return storeInstance;
      }

      return getInstance;
    }(),
    setState: function () {
      function setState(nextState) {
        doSetState(this, storeInstance, nextState);
      }

      return setState;
    }()
  }, StoreModel));

  // bind the store listeners
  /* istanbul ignore else */
  if (StoreProto.bindListeners) {
    _StoreMixin2.default.bindListeners.call(StoreProto, StoreProto.bindListeners);
  }
  /* istanbul ignore else */
  if (StoreProto.observe) {
    _StoreMixin2.default.bindListeners.call(StoreProto, StoreProto.observe(alt));
  }

  // bind the lifecycle events
  /* istanbul ignore else */
  if (StoreProto.lifecycle) {
    fn.eachObject(function (eventName, event) {
      _StoreMixin2.default.on.call(StoreProto, eventName, event);
    }, [StoreProto.lifecycle]);
  }

  // create the instance and fn.assign the public methods to the instance
  storeInstance = fn.assign(new _AltStore2.default(alt, StoreProto, StoreProto.state !== undefined ? StoreProto.state : {}, StoreModel), StoreProto.publicMethods, {
    displayName: key,
    config: StoreModel.config
  });

  return storeInstance;
}

function createStoreFromClass(alt, StoreModel, key) {
  var storeInstance = void 0;
  var config = StoreModel.config;

  // Creating a class here so we don't overload the provided store's
  // prototype with the mixin behaviour and I'm extending from StoreModel
  // so we can inherit any extensions from the provided store.

  var Store = function (_StoreModel) {
    _inherits(Store, _StoreModel);

    function Store() {
      _classCallCheck(this, Store);

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _possibleConstructorReturn(this, _StoreModel.call.apply(_StoreModel, [this].concat(args)));
    }

    return Store;
  }(StoreModel);

  createPrototype(Store.prototype, alt, key, {
    type: 'AltStore',
    getInstance: function () {
      function getInstance() {
        return storeInstance;
      }

      return getInstance;
    }(),
    setState: function () {
      function setState(nextState) {
        doSetState(this, storeInstance, nextState);
      }

      return setState;
    }()
  });

  for (var _len = arguments.length, argsForClass = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    argsForClass[_key - 3] = arguments[_key];
  }

  var store = new (Function.prototype.bind.apply(Store, [null].concat(argsForClass)))();

  /* istanbul ignore next */
  if (config.bindListeners) store.bindListeners(config.bindListeners);
  /* istanbul ignore next */
  if (config.datasource) store.registerAsync(config.datasource);

  storeInstance = fn.assign(new _AltStore2.default(alt, store, store.state !== undefined ? store.state : store, StoreModel), utils.getInternalMethods(StoreModel), config.publicMethods, { displayName: key });

  return storeInstance;
}
},{"../functions":4,"../utils/AltUtils":9,"./AltStore":6,"./StoreMixin":7}],9:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInternalMethods = getInternalMethods;
exports.getPrototypeChain = getPrototypeChain;
exports.warn = warn;
exports.uid = uid;
exports.formatAsConstant = formatAsConstant;
exports.dispatchIdentity = dispatchIdentity;
exports.fsa = fsa;
exports.dispatch = dispatch;

var _functions = require('../functions');

var fn = _interopRequireWildcard(_functions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

/*eslint-disable*/
var builtIns = Object.getOwnPropertyNames(NoopClass);
var builtInProto = Object.getOwnPropertyNames(NoopClass.prototype);
/*eslint-enable*/

function getInternalMethods(Obj, isProto) {
  var excluded = isProto ? builtInProto : builtIns;
  var obj = isProto ? Obj.prototype : Obj;
  return Object.getOwnPropertyNames(obj).reduce(function (value, m) {
    if (excluded.indexOf(m) !== -1) {
      return value;
    }

    value[m] = obj[m];
    return value;
  }, {});
}

function getPrototypeChain(Obj) {
  var methods = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return Obj === Function.prototype ? methods : getPrototypeChain(Object.getPrototypeOf(Obj), fn.assign(methods, getInternalMethods(Obj, true)));
}

function warn(msg) {
  /* istanbul ignore else */
  /*eslint-disable*/
  if (typeof console !== 'undefined') {
    console.warn(new ReferenceError(msg));
  }
  /*eslint-enable*/
}

function uid(container, name) {
  var count = 0;
  var key = name;
  while (Object.hasOwnProperty.call(container, key)) {
    key = name + String(++count);
  }
  return key;
}

function formatAsConstant(name) {
  return name.replace(/[a-z]([A-Z])/g, function (i) {
    return String(i[0]) + '_' + String(i[1].toLowerCase());
  }).toUpperCase();
}

function dispatchIdentity(x) {
  if (x === undefined) return null;

  for (var _len = arguments.length, a = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    a[_key - 1] = arguments[_key];
  }

  return a.length ? [x].concat(a) : x;
}

function fsa(id, type, payload, details) {
  return {
    type: type,
    payload: payload,
    meta: _extends({
      dispatchId: id
    }, details),

    id: id,
    action: type,
    data: payload,
    details: details
  };
}

function dispatch(id, actionObj, payload, alt) {
  var data = actionObj.dispatch(payload);
  if (data === undefined) return null;

  var type = actionObj.id;
  var namespace = type;
  var name = type;
  var details = { id: type, namespace: namespace, name: name };

  var dispatchLater = function dispatchLater(x) {
    return alt.dispatch(type, x, details);
  };

  if (fn.isFunction(data)) return data(dispatchLater, alt);

  // XXX standardize this
  return alt.dispatcher.dispatch(fsa(id, type, data, details));
}

/* istanbul ignore next */
function NoopClass() {}
},{"../functions":4}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setAppState = setAppState;
exports.snapshot = snapshot;
exports.saveInitialSnapshot = saveInitialSnapshot;
exports.filterSnapshots = filterSnapshots;

var _functions = require('../functions');

var fn = _interopRequireWildcard(_functions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function setAppState(instance, data, onStore) {
  var obj = instance.deserialize(data);
  fn.eachObject(function (key, value) {
    var store = instance.stores[key];
    if (store) {
      (function () {
        var config = store.StoreModel.config;

        var state = store.state;
        if (config.onDeserialize) obj[key] = config.onDeserialize(value) || value;
        if (fn.isMutableObject(state)) {
          fn.eachObject(function (k) {
            return delete state[k];
          }, [state]);
          fn.assign(state, obj[key]);
        } else {
          store.state = obj[key];
        }
        onStore(store, store.state);
      })();
    }
  }, [obj]);
}

function snapshot(instance) {
  var storeNames = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

  var stores = storeNames.length ? storeNames : Object.keys(instance.stores);
  return stores.reduce(function (obj, storeHandle) {
    var storeName = storeHandle.displayName || storeHandle;
    var store = instance.stores[storeName];
    var config = store.StoreModel.config;

    store.lifecycle('snapshot');
    var customSnapshot = config.onSerialize && config.onSerialize(store.state);
    obj[storeName] = customSnapshot ? customSnapshot : store.getState();
    return obj;
  }, {});
}

function saveInitialSnapshot(instance, key) {
  var state = instance.deserialize(instance.serialize(instance.stores[key].state));
  instance._initSnapshot[key] = state;
  instance._lastSnapshot[key] = state;
}

function filterSnapshots(instance, state, stores) {
  return stores.reduce(function (obj, store) {
    var storeName = store.displayName || store;
    if (!state[storeName]) {
      throw new ReferenceError(String(storeName) + ' is not a valid store');
    }
    obj[storeName] = state[storeName];
    return obj;
  }, {});
}
},{"../functions":4}],11:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function (condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error('Invariant Violation: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;
}).call(this,require('_process'))

},{"_process":15}],12:[function(require,module,exports){
/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = require('./lib/Dispatcher');

},{"./lib/Dispatcher":13}],13:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * 
 * @preventMunge
 */

'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var invariant = require('fbjs/lib/invariant');

var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *   CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *         case 'city-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

var Dispatcher = (function () {
  function Dispatcher() {
    _classCallCheck(this, Dispatcher);

    this._callbacks = {};
    this._isDispatching = false;
    this._isHandled = {};
    this._isPending = {};
    this._lastID = 1;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   */

  Dispatcher.prototype.register = function register(callback) {
    var id = _prefix + this._lastID++;
    this._callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   */

  Dispatcher.prototype.unregister = function unregister(id) {
    !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.unregister(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
    delete this._callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   */

  Dispatcher.prototype.waitFor = function waitFor(ids) {
    !this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Must be invoked while dispatching.') : invariant(false) : undefined;
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this._isPending[id]) {
        !this._isHandled[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Circular dependency detected while ' + 'waiting for `%s`.', id) : invariant(false) : undefined;
        continue;
      }
      !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
      this._invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   */

  Dispatcher.prototype.dispatch = function dispatch(payload) {
    !!this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.') : invariant(false) : undefined;
    this._startDispatching(payload);
    try {
      for (var id in this._callbacks) {
        if (this._isPending[id]) {
          continue;
        }
        this._invokeCallback(id);
      }
    } finally {
      this._stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   */

  Dispatcher.prototype.isDispatching = function isDispatching() {
    return this._isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @internal
   */

  Dispatcher.prototype._invokeCallback = function _invokeCallback(id) {
    this._isPending[id] = true;
    this._callbacks[id](this._pendingPayload);
    this._isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @internal
   */

  Dispatcher.prototype._startDispatching = function _startDispatching(payload) {
    for (var id in this._callbacks) {
      this._isPending[id] = false;
      this._isHandled[id] = false;
    }
    this._pendingPayload = payload;
    this._isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */

  Dispatcher.prototype._stopDispatching = function _stopDispatching() {
    delete this._pendingPayload;
    this._isDispatching = false;
  };

  return Dispatcher;
})();

module.exports = Dispatcher;
}).call(this,require('_process'))

},{"_process":15,"fbjs/lib/invariant":11}],14:[function(require,module,exports){
module.exports = isPromise;

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

},{}],15:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
  try {
    cachedSetTimeout = setTimeout;
  } catch (e) {
    cachedSetTimeout = function () {
      throw new Error('setTimeout is not defined');
    }
  }
  try {
    cachedClearTimeout = clearTimeout;
  } catch (e) {
    cachedClearTimeout = function () {
      throw new Error('clearTimeout is not defined');
    }
  }
} ())
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = cachedSetTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    cachedClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        cachedSetTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],16:[function(require,module,exports){
'use strict';

function transmitter() {
  var subscriptions = [];
  var pushing = false;
  var toUnsubscribe = [];

  var unsubscribe = function unsubscribe(onChange) {
    if (pushing) {
      toUnsubscribe.push(onChange);
      return;
    }
    var id = subscriptions.indexOf(onChange);
    if (id >= 0) subscriptions.splice(id, 1);
  };

  var subscribe = function subscribe(onChange) {
    subscriptions.push(onChange);
    var dispose = function dispose() {
      return unsubscribe(onChange);
    };
    return { dispose: dispose };
  };

  var push = function push(value) {
    if (pushing) throw new Error('Cannot push while pushing');
    pushing = true;
    try {
      subscriptions.forEach(function (subscription) {
        return subscription(value);
      });
    } finally {
      pushing = false;
      toUnsubscribe = toUnsubscribe.filter(unsubscribe);
    }
  };

  return { subscribe: subscribe, push: push, unsubscribe: unsubscribe, subscriptions: subscriptions };
}

module.exports = transmitter;


},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Example = require('./Example');

var _Example2 = _interopRequireDefault(_Example);

var _flux = require('./flux');

var _flux2 = _interopRequireDefault(_flux);

var _connectToStores = require('alt-utils/lib/connectToStores');

var _connectToStores2 = _interopRequireDefault(_connectToStores);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* flux */


var App = function (_Component) {
  _inherits(App, _Component);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(App).apply(this, arguments));
  }

  _createClass(App, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      console.log(JSON.stringify(_flux2.default.actions.app));
      console.log('app mounted');
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.monitorWindowSize !== this.props.monitorWindowSize) {
        this.setWindowSizeListeners(nextProps.monitorWindowSize);
      }
    }
  }, {
    key: 'setWindowSizeListeners',
    value: function setWindowSizeListeners(enabled) {
      console.log('setWindowSizeListeners ' + enabled);
      if (!enabled) {
        return $(window).off("resize");
      }

      this.checkWindowSize();
      $(window).resize(this.checkWindowSize.bind(this));
    }
  }, {
    key: 'checkWindowSize',
    value: function checkWindowSize() {
      if (window.matchMedia("screen and (max-width : 544px)").matches) {
        this.updateWindowSize('xs');
      } else if (window.matchMedia("screen and (max-width : 768px)").matches) {
        this.updateWindowSize('sm');
      } else if (window.matchMedia("screen and (max-width : 992px)").matches) {
        this.updateWindowSize('md');
      } else {
        this.updateWindowSize('lg');
      }
    }
  }, {
    key: 'updateWindowSize',
    value: function updateWindowSize(size) {
      if (size !== this.props.windowSize) {
        console.log('updateWindowSize ' + size);
        _flux2.default.actions.app.setWindowSize(size);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _flux2.default.actions.app.monitorWindowSize(false);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(_Example2.default, null);
    }
  }], [{
    key: 'componentDidConnect',
    value: function componentDidConnect() {
      _flux2.default.actions.app.monitorWindowSize(true);
    }
  }, {
    key: 'getStores',
    value: function getStores(props) {
      console.log('get stores');
      return [_flux2.default.stores.app];
    }
  }, {
    key: 'getPropsFromStores',
    value: function getPropsFromStores(props) {
      var appState = _flux2.default.stores.app.getState();

      return {
        monitorWindowSize: appState.monitorWindowSize,
        windowSize: appState.windowSize
      };
    }
  }]);

  return App;
}(_react.Component);

exports.default = (0, _connectToStores2.default)(App);
module.exports = exports['default'];

},{"./Example":18,"./flux":23,"alt-utils/lib/connectToStores":1,"react":"react"}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ResponsiveComponent2 = require('./ResponsiveComponent');

var _ResponsiveComponent3 = _interopRequireDefault(_ResponsiveComponent2);

var _flux = require('./flux');

var _flux2 = _interopRequireDefault(_flux);

var _connectToStores = require('alt-utils/lib/connectToStores');

var _connectToStores2 = _interopRequireDefault(_connectToStores);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* flux */


var Example = function (_ResponsiveComponent) {
  _inherits(Example, _ResponsiveComponent);

  function Example() {
    _classCallCheck(this, Example);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Example).apply(this, arguments));
  }

  _createClass(Example, [{
    key: 'renderMobile',
    value: function renderMobile() {
      return _react2.default.createElement(
        'div',
        null,
        'Mobile'
      );
    }
  }, {
    key: 'renderDesktop',
    value: function renderDesktop() {
      return _react2.default.createElement(
        'div',
        null,
        'Desktop'
      );
    }
  }], [{
    key: 'getStores',
    value: function getStores() {
      return [_flux2.default.stores.app];
    }
  }, {
    key: 'getPropsFromStores',
    value: function getPropsFromStores() {
      var appState = _flux2.default.stores.app.getState();

      return {
        windowSize: appState.windowSize
      };
    }
  }]);

  return Example;
}(_ResponsiveComponent3.default);

exports.default = (0, _connectToStores2.default)(Example);
module.exports = exports['default'];

},{"./ResponsiveComponent":19,"./flux":23,"alt-utils/lib/connectToStores":1,"react":"react"}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var methodMap = {
  xs: 'ExtraSmall',
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
  desktop: 'Desktop',
  mobile: 'Mobile'
};

var ResponsiveComponent = function (_Component) {
  _inherits(ResponsiveComponent, _Component);

  function ResponsiveComponent() {
    _classCallCheck(this, ResponsiveComponent);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ResponsiveComponent).apply(this, arguments));
  }

  _createClass(ResponsiveComponent, [{
    key: 'render',
    value: function render() {
      var markup = void 0;
      if (['xs', 'sm'].indexOf(this.props.windowSize) != -1) {
        if (this.renderMobile) {
          markup = this.renderMobile();
        } else {
          markup = this.renderSize();
        }
      } else {
        if (this.renderDesktop) {
          markup = this.renderDesktop();
        } else {
          markup = this.renderSize();
        }
      }

      return markup;
    }
  }, {
    key: 'renderSize',
    value: function renderSize() {
      var _this = this;
      var renderOrder = ['desktop', 'lg', 'md', 'sm', 'xs', 'mobile'];
      var startingPoint = renderOrder.indexOf(this.props.windowSize);
      var availableSizes = renderOrder.slice(startingPoint, renderOrder.length);
      /* search down the line for the first available render method*/
      var size = _.find(availableSizes, function (size) {
        return _this['render' + methodMap[size]];
      });

      var markup = void 0;
      if (!size) {
        /* try searching up the line */
        availableSizes = _.reverse(renderOrder.slice(0, startingPoint));
        size = _.find(availableSizes, function (size) {
          return _this['render' + methodMap[size]];
        });

        if (!size) {
          markup = _react2.default.createElement(
            'div',
            null,
            'This component does not implement responsive render methods'
          );
        }
      } else {
        markup = this['render' + methodMap[size]]();
      }

      return markup;
    }
  }]);

  return ResponsiveComponent;
}(_react.Component);

exports.default = ResponsiveComponent;
module.exports = exports['default'];

},{"react":"react"}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AppActions = function AppActions() {
  _classCallCheck(this, AppActions);

  var simpleActions = ['monitorWindowSize', 'setWindowSize'];

  this.generateActions.apply(this, simpleActions);
};

exports.default = _alt2.default.createActions(AppActions);
module.exports = exports['default'];

},{"../alt":22}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  app: require('./app')
};
module.exports = exports['default'];

},{"./app":20}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alt = require('alt');

var _alt2 = _interopRequireDefault(_alt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = new _alt2.default();
module.exports = exports['default'];

},{"alt":5}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  actions: require('./actions'),
  stores: require('./stores')
};
module.exports = exports['default'];

},{"./actions":21,"./stores":25}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _alt = require('../alt');

var _alt2 = _interopRequireDefault(_alt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Actions = _alt2.default.actions.AppActions;

var AppStore = function () {
  function AppStore() {
    _classCallCheck(this, AppStore);

    this.setDefaults();

    this.bindListeners({
      setMonitorWindowSize: Actions.monitorWindowSize,
      setWindowSize: Actions.setWindowSize
    });
  }

  _createClass(AppStore, [{
    key: 'reset',
    value: function reset() {
      this.setDefaults();
    }
  }, {
    key: 'setDefaults',
    value: function setDefaults() {
      this.monitorWindowSize = false;
      this.windowSize = 'lg';
    }
  }, {
    key: 'setCurrentWindowSize',
    value: function setCurrentWindowSize(value) {
      this.currentWindowSize = value;
    }
  }, {
    key: 'setMonitorWindowSize',
    value: function setMonitorWindowSize(value) {
      this.monitorWindowSize = value;
    }
  }, {
    key: 'setWindowSize',
    value: function setWindowSize(value) {
      this.windowSize = value;
    }
  }]);

  return AppStore;
}();

exports.default = _alt2.default.createStore(AppStore);
module.exports = exports['default'];

},{"../alt":22}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  app: require('./app')
};
module.exports = exports['default'];

},{"./app":24}],26:[function(require,module,exports){
'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _App = require('./App');

var _App2 = _interopRequireDefault(_App);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _reactDom.render)(_react2.default.createElement(_App2.default, null), document.getElementById('root'));

},{"./App":17,"react":"react","react-dom":"react-dom"}]},{},[26])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYWx0LXV0aWxzL2xpYi9jb25uZWN0VG9TdG9yZXMuanMiLCJub2RlX21vZHVsZXMvYWx0LXV0aWxzL2xpYi9mdW5jdGlvbnMuanMiLCJub2RlX21vZHVsZXMvYWx0L2xpYi9hY3Rpb25zL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2FsdC9saWIvZnVuY3Rpb25zLmpzIiwibm9kZV9tb2R1bGVzL2FsdC9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYWx0L2xpYi9zdG9yZS9BbHRTdG9yZS5qcyIsIm5vZGVfbW9kdWxlcy9hbHQvbGliL3N0b3JlL1N0b3JlTWl4aW4uanMiLCJub2RlX21vZHVsZXMvYWx0L2xpYi9zdG9yZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hbHQvbGliL3V0aWxzL0FsdFV0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2FsdC9saWIvdXRpbHMvU3RhdGVGdW5jdGlvbnMuanMiLCJub2RlX21vZHVsZXMvZmJqcy9saWIvaW52YXJpYW50LmpzIiwibm9kZV9tb2R1bGVzL2ZsdXgvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZmx1eC9saWIvRGlzcGF0Y2hlci5qcyIsIm5vZGVfbW9kdWxlcy9pcy1wcm9taXNlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy90cmFuc21pdHRlci9kaXN0L3RyYW5zbWl0dGVyLmpzIiwic3JjL0FwcC5qcyIsInNyYy9FeGFtcGxlLmpzIiwic3JjL1Jlc3BvbnNpdmVDb21wb25lbnQuanMiLCJzcmMvZmx1eC9hY3Rpb25zL2FwcC5qcyIsInNyYy9mbHV4L2FjdGlvbnMvaW5kZXguanMiLCJzcmMvZmx1eC9hbHQuanMiLCJzcmMvZmx1eC9pbmRleC5qcyIsInNyYy9mbHV4L3N0b3Jlcy9hcHAuanMiLCJzcmMvZmx1eC9zdG9yZXMvaW5kZXguanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FDMUNBOzs7O0FBQ0E7Ozs7QUFHQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7QUFGQTs7O0lBSU0sRzs7Ozs7Ozs7Ozs7d0NBb0JnQjtBQUNsQixjQUFRLEdBQVIsQ0FBWSxLQUFLLFNBQUwsQ0FBZSxlQUFLLE9BQUwsQ0FBYSxHQUE1QixDQUFaO0FBQ0EsY0FBUSxHQUFSLENBQVksYUFBWjtBQUNEOzs7OENBRXlCLFMsRUFBVztBQUNuQyxVQUFJLFVBQVUsaUJBQVYsS0FBZ0MsS0FBSyxLQUFMLENBQVcsaUJBQS9DLEVBQWtFO0FBQ2hFLGFBQUssc0JBQUwsQ0FBNEIsVUFBVSxpQkFBdEM7QUFDRDtBQUNGOzs7MkNBRXNCLE8sRUFBUztBQUM5QixjQUFRLEdBQVIsNkJBQXNDLE9BQXRDO0FBQ0EsVUFBSSxDQUFDLE9BQUwsRUFBYztBQUNaLGVBQU8sRUFBRSxNQUFGLEVBQVUsR0FBVixDQUFjLFFBQWQsQ0FBUDtBQUNEOztBQUVELFdBQUssZUFBTDtBQUNBLFFBQUUsTUFBRixFQUFVLE1BQVYsQ0FBaUIsS0FBSyxlQUFMLENBQXFCLElBQXJCLENBQTBCLElBQTFCLENBQWpCO0FBQ0Q7OztzQ0FFaUI7QUFDaEIsVUFBSSxPQUFPLFVBQVAsQ0FBa0IsZ0NBQWxCLEVBQW9ELE9BQXhELEVBQWdFO0FBQzlELGFBQUssZ0JBQUwsQ0FBc0IsSUFBdEI7QUFDRCxPQUZELE1BRU8sSUFBSSxPQUFPLFVBQVAsQ0FBa0IsZ0NBQWxCLEVBQW9ELE9BQXhELEVBQWlFO0FBQ3RFLGFBQUssZ0JBQUwsQ0FBc0IsSUFBdEI7QUFDRCxPQUZNLE1BRUEsSUFBSSxPQUFPLFVBQVAsQ0FBa0IsZ0NBQWxCLEVBQW9ELE9BQXhELEVBQWlFO0FBQ3RFLGFBQUssZ0JBQUwsQ0FBc0IsSUFBdEI7QUFDRCxPQUZNLE1BRUE7QUFDTCxhQUFLLGdCQUFMLENBQXNCLElBQXRCO0FBQ0Q7QUFDRjs7O3FDQUVnQixJLEVBQU07QUFDckIsVUFBSSxTQUFTLEtBQUssS0FBTCxDQUFXLFVBQXhCLEVBQW9DO0FBQ2xDLGdCQUFRLEdBQVIsdUJBQWdDLElBQWhDO0FBQ0EsdUJBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsYUFBakIsQ0FBK0IsSUFBL0I7QUFDRDtBQUNGOzs7MkNBRXNCO0FBQ3JCLHFCQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLGlCQUFqQixDQUFtQyxLQUFuQztBQUNEOzs7NkJBRVE7QUFDUCxhQUNFLHNEQURGO0FBR0Q7OzswQ0FsRTRCO0FBQzNCLHFCQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLGlCQUFqQixDQUFtQyxJQUFuQztBQUNEOzs7OEJBRWdCLEssRUFBTztBQUN0QixjQUFRLEdBQVIsQ0FBWSxZQUFaO0FBQ0EsYUFBTyxDQUFDLGVBQUssTUFBTCxDQUFZLEdBQWIsQ0FBUDtBQUNEOzs7dUNBRXlCLEssRUFBTztBQUMvQixVQUFJLFdBQVcsZUFBSyxNQUFMLENBQVksR0FBWixDQUFnQixRQUFoQixFQUFmOztBQUVBLGFBQU87QUFDTCwyQkFBbUIsU0FBUyxpQkFEdkI7QUFFTCxvQkFBWSxTQUFTO0FBRmhCLE9BQVA7QUFJRDs7Ozs7O2tCQXFEWSwrQkFBZ0IsR0FBaEIsQzs7Ozs7Ozs7Ozs7O0FDOUVmOzs7O0FBQ0E7Ozs7QUFHQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7QUFGQTs7O0lBSU0sTzs7Ozs7Ozs7Ozs7bUNBY1c7QUFDYixhQUNFO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FERjtBQUdEOzs7b0NBRWU7QUFDZCxhQUNFO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FERjtBQUdEOzs7Z0NBdEJrQjtBQUNqQixhQUFPLENBQUMsZUFBSyxNQUFMLENBQVksR0FBYixDQUFQO0FBQ0Q7Ozt5Q0FFMkI7QUFDMUIsVUFBSSxXQUFXLGVBQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0IsUUFBaEIsRUFBZjs7QUFFQSxhQUFPO0FBQ0wsb0JBQVksU0FBUztBQURoQixPQUFQO0FBR0Q7Ozs7OztrQkFlWSwrQkFBZ0IsT0FBaEIsQzs7OztBQ2xDZjs7Ozs7Ozs7QUFFQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTSxZQUFZO0FBQ2hCLE1BQUksWUFEWTtBQUVoQixNQUFJLE9BRlk7QUFHaEIsTUFBSSxRQUhZO0FBSWhCLE1BQUksT0FKWTtBQUtoQixXQUFTLFNBTE87QUFNaEIsVUFBUTtBQU5RLENBQWxCOztJQVNxQixtQjs7Ozs7Ozs7Ozs7NkJBRVY7QUFDUCxVQUFJLGVBQUo7QUFDQSxVQUFJLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxPQUFiLENBQXFCLEtBQUssS0FBTCxDQUFXLFVBQWhDLEtBQStDLENBQUMsQ0FBcEQsRUFBdUQ7QUFDckQsWUFBSSxLQUFLLFlBQVQsRUFBdUI7QUFDckIsbUJBQVMsS0FBSyxZQUFMLEVBQVQ7QUFDRCxTQUZELE1BRU87QUFDTCxtQkFBUyxLQUFLLFVBQUwsRUFBVDtBQUNEO0FBQ0YsT0FORCxNQU1PO0FBQ0wsWUFBSSxLQUFLLGFBQVQsRUFBd0I7QUFDdEIsbUJBQVMsS0FBSyxhQUFMLEVBQVQ7QUFDRCxTQUZELE1BRU87QUFDTCxtQkFBUyxLQUFLLFVBQUwsRUFBVDtBQUNEO0FBQ0Y7O0FBRUQsYUFBTyxNQUFQO0FBQ0Q7OztpQ0FFWTtBQUNYLFVBQUksUUFBUSxJQUFaO0FBQ0EsVUFBSSxjQUFjLENBQUMsU0FBRCxFQUFZLElBQVosRUFBa0IsSUFBbEIsRUFBd0IsSUFBeEIsRUFBOEIsSUFBOUIsRUFBb0MsUUFBcEMsQ0FBbEI7QUFDQSxVQUFJLGdCQUFnQixZQUFZLE9BQVosQ0FBb0IsS0FBSyxLQUFMLENBQVcsVUFBL0IsQ0FBcEI7QUFDQSxVQUFJLGlCQUFpQixZQUFZLEtBQVosQ0FBa0IsYUFBbEIsRUFBaUMsWUFBWSxNQUE3QyxDQUFyQjtBQUNBO0FBQ0EsVUFBSSxPQUFPLEVBQUUsSUFBRixDQUFPLGNBQVAsRUFBdUIsVUFBQyxJQUFELEVBQVU7QUFDMUMsZUFBTyxNQUFNLFdBQVMsVUFBVSxJQUFWLENBQWYsQ0FBUDtBQUNELE9BRlUsQ0FBWDs7QUFJQSxVQUFJLGVBQUo7QUFDQSxVQUFJLENBQUMsSUFBTCxFQUFXO0FBQ1Q7QUFDQSx5QkFBaUIsRUFBRSxPQUFGLENBQVUsWUFBWSxLQUFaLENBQWtCLENBQWxCLEVBQXFCLGFBQXJCLENBQVYsQ0FBakI7QUFDQSxlQUFPLEVBQUUsSUFBRixDQUFPLGNBQVAsRUFBdUIsVUFBQyxJQUFELEVBQVU7QUFDdEMsaUJBQU8sTUFBTSxXQUFTLFVBQVUsSUFBVixDQUFmLENBQVA7QUFDRCxTQUZNLENBQVA7O0FBSUEsWUFBSSxDQUFDLElBQUwsRUFBVztBQUNULG1CQUFVO0FBQUE7QUFBQTtBQUFBO0FBQUEsV0FBVjtBQUNEO0FBQ0YsT0FWRCxNQVVPO0FBQ0wsaUJBQVMsS0FBSyxXQUFTLFVBQVUsSUFBVixDQUFkLEdBQVQ7QUFDRDs7QUFFRCxhQUFPLE1BQVA7QUFDRDs7Ozs7O2tCQS9Da0IsbUI7Ozs7Ozs7Ozs7QUNickI7Ozs7Ozs7O0lBRU0sVSxHQUVKLHNCQUFjO0FBQUE7O0FBQ1osTUFBSSxnQkFBZ0IsQ0FDbEIsbUJBRGtCLEVBRWxCLGVBRmtCLENBQXBCOztBQUtBLE9BQUssZUFBTCxDQUFxQixLQUFyQixDQUEyQixJQUEzQixFQUFpQyxhQUFqQztBQUNELEM7O2tCQUdZLGNBQUksYUFBSixDQUFrQixVQUFsQixDOzs7Ozs7Ozs7a0JDZEE7QUFDYixPQUFLLFFBQVEsT0FBUjtBQURRLEM7Ozs7Ozs7Ozs7QUNBZjs7Ozs7O2tCQUNlLG1COzs7Ozs7Ozs7a0JDREE7QUFDYixXQUFTLFFBQVEsV0FBUixDQURJO0FBRWIsVUFBUSxRQUFRLFVBQVI7QUFGSyxDOzs7Ozs7Ozs7Ozs7QUNBZjs7Ozs7Ozs7QUFFQSxJQUFNLFVBQVUsY0FBSSxPQUFKLENBQVksVUFBNUI7O0lBRU0sUTtBQUVKLHNCQUFjO0FBQUE7O0FBQ1osU0FBSyxXQUFMOztBQUVBLFNBQUssYUFBTCxDQUFtQjtBQUNqQiw0QkFBc0IsUUFBUSxpQkFEYjtBQUVqQixxQkFBZSxRQUFRO0FBRk4sS0FBbkI7QUFJRDs7Ozs0QkFFTztBQUNOLFdBQUssV0FBTDtBQUNEOzs7a0NBRWE7QUFDWixXQUFLLGlCQUFMLEdBQXlCLEtBQXpCO0FBQ0EsV0FBSyxVQUFMLEdBQWtCLElBQWxCO0FBQ0Q7Ozt5Q0FFb0IsSyxFQUFPO0FBQzFCLFdBQUssaUJBQUwsR0FBeUIsS0FBekI7QUFDRDs7O3lDQUVvQixLLEVBQU87QUFDMUIsV0FBSyxpQkFBTCxHQUF5QixLQUF6QjtBQUNEOzs7a0NBRWEsSyxFQUFPO0FBQ25CLFdBQUssVUFBTCxHQUFrQixLQUFsQjtBQUNEOzs7Ozs7a0JBR1ksY0FBSSxXQUFKLENBQWdCLFFBQWhCLEM7Ozs7Ozs7OztrQkNyQ0E7QUFDYixPQUFLLFFBQVEsT0FBUjtBQURRLEM7Ozs7OztBQ0FmOzs7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBLHNCQUNFLGtEQURGLEVBRUUsU0FBUyxjQUFULENBQXdCLE1BQXhCLENBRkYiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiAnSGlnaGVyIE9yZGVyIENvbXBvbmVudCcgdGhhdCBjb250cm9scyB0aGUgcHJvcHMgb2YgYSB3cmFwcGVkXG4gKiBjb21wb25lbnQgdmlhIHN0b3Jlcy5cbiAqXG4gKiBFeHBlY3RzIHRoZSBDb21wb25lbnQgdG8gaGF2ZSB0d28gc3RhdGljIG1ldGhvZHM6XG4gKiAgIC0gZ2V0U3RvcmVzKCk6IFNob3VsZCByZXR1cm4gYW4gYXJyYXkgb2Ygc3RvcmVzLlxuICogICAtIGdldFByb3BzRnJvbVN0b3Jlcyhwcm9wcyk6IFNob3VsZCByZXR1cm4gdGhlIHByb3BzIGZyb20gdGhlIHN0b3Jlcy5cbiAqXG4gKiBFeGFtcGxlIHVzaW5nIG9sZCBSZWFjdC5jcmVhdGVDbGFzcygpIHN0eWxlOlxuICpcbiAqICAgIGNvbnN0IE15Q29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICogICAgICBzdGF0aWNzOiB7XG4gKiAgICAgICAgZ2V0U3RvcmVzKHByb3BzKSB7XG4gKiAgICAgICAgICByZXR1cm4gW215U3RvcmVdXG4gKiAgICAgICAgfSxcbiAqICAgICAgICBnZXRQcm9wc0Zyb21TdG9yZXMocHJvcHMpIHtcbiAqICAgICAgICAgIHJldHVybiBteVN0b3JlLmdldFN0YXRlKClcbiAqICAgICAgICB9XG4gKiAgICAgIH0sXG4gKiAgICAgIHJlbmRlcigpIHtcbiAqICAgICAgICAvLyBVc2UgdGhpcy5wcm9wcyBsaWtlIG5vcm1hbCAuLi5cbiAqICAgICAgfVxuICogICAgfSlcbiAqICAgIE15Q29tcG9uZW50ID0gY29ubmVjdFRvU3RvcmVzKE15Q29tcG9uZW50KVxuICpcbiAqXG4gKiBFeGFtcGxlIHVzaW5nIEVTNiBDbGFzczpcbiAqXG4gKiAgICBjbGFzcyBNeUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gKiAgICAgIHN0YXRpYyBnZXRTdG9yZXMocHJvcHMpIHtcbiAqICAgICAgICByZXR1cm4gW215U3RvcmVdXG4gKiAgICAgIH1cbiAqICAgICAgc3RhdGljIGdldFByb3BzRnJvbVN0b3Jlcyhwcm9wcykge1xuICogICAgICAgIHJldHVybiBteVN0b3JlLmdldFN0YXRlKClcbiAqICAgICAgfVxuICogICAgICByZW5kZXIoKSB7XG4gKiAgICAgICAgLy8gVXNlIHRoaXMucHJvcHMgbGlrZSBub3JtYWwgLi4uXG4gKiAgICAgIH1cbiAqICAgIH1cbiAqICAgIE15Q29tcG9uZW50ID0gY29ubmVjdFRvU3RvcmVzKE15Q29tcG9uZW50KVxuICpcbiAqIEEgZ3JlYXQgZXhwbGFuYXRpb24gb2YgdGhlIG1lcml0cyBvZiBoaWdoZXIgb3JkZXIgY29tcG9uZW50cyBjYW4gYmUgZm91bmQgYXRcbiAqIGh0dHA6Ly9iaXQubHkvMWFiUGtyUFxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX2Z1bmN0aW9ucyA9IHJlcXVpcmUoJy4vZnVuY3Rpb25zJyk7XG5cbmZ1bmN0aW9uIGNvbm5lY3RUb1N0b3JlcyhTcGVjKSB7XG4gIHZhciBDb21wb25lbnQgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBTcGVjIDogYXJndW1lbnRzWzFdO1xuICByZXR1cm4gKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBDaGVjayBmb3IgcmVxdWlyZWQgc3RhdGljIG1ldGhvZHMuXG4gICAgaWYgKCEoMCwgX2Z1bmN0aW9ucy5pc0Z1bmN0aW9uKShTcGVjLmdldFN0b3JlcykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdFRvU3RvcmVzKCkgZXhwZWN0cyB0aGUgd3JhcHBlZCBjb21wb25lbnQgdG8gaGF2ZSBhIHN0YXRpYyBnZXRTdG9yZXMoKSBtZXRob2QnKTtcbiAgICB9XG4gICAgaWYgKCEoMCwgX2Z1bmN0aW9ucy5pc0Z1bmN0aW9uKShTcGVjLmdldFByb3BzRnJvbVN0b3JlcykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY29ubmVjdFRvU3RvcmVzKCkgZXhwZWN0cyB0aGUgd3JhcHBlZCBjb21wb25lbnQgdG8gaGF2ZSBhIHN0YXRpYyBnZXRQcm9wc0Zyb21TdG9yZXMoKSBtZXRob2QnKTtcbiAgICB9XG5cbiAgICB2YXIgU3RvcmVDb25uZWN0aW9uID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICAgIGRpc3BsYXlOYW1lOiAnU3RhdGVmdWwnICsgKENvbXBvbmVudC5kaXNwbGF5TmFtZSB8fCBDb21wb25lbnQubmFtZSB8fCAnQ29udGFpbmVyJyksXG5cbiAgICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gU3BlYy5nZXRQcm9wc0Zyb21TdG9yZXModGhpcy5wcm9wcywgdGhpcy5jb250ZXh0KTtcbiAgICAgIH0sXG5cbiAgICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoU3BlYy5nZXRQcm9wc0Zyb21TdG9yZXMobmV4dFByb3BzLCB0aGlzLmNvbnRleHQpKTtcbiAgICAgIH0sXG5cbiAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICB2YXIgc3RvcmVzID0gU3BlYy5nZXRTdG9yZXModGhpcy5wcm9wcywgdGhpcy5jb250ZXh0KTtcbiAgICAgICAgdGhpcy5zdG9yZUxpc3RlbmVycyA9IHN0b3Jlcy5tYXAoZnVuY3Rpb24gKHN0b3JlKSB7XG4gICAgICAgICAgcmV0dXJuIHN0b3JlLmxpc3RlbihfdGhpcy5vbkNoYW5nZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoU3BlYy5jb21wb25lbnREaWRDb25uZWN0KSB7XG4gICAgICAgICAgU3BlYy5jb21wb25lbnREaWRDb25uZWN0KHRoaXMucHJvcHMsIHRoaXMuY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbiBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5zdG9yZUxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uICh1bmxpc3Rlbikge1xuICAgICAgICAgIHJldHVybiB1bmxpc3RlbigpO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiBvbkNoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZShTcGVjLmdldFByb3BzRnJvbVN0b3Jlcyh0aGlzLnByb3BzLCB0aGlzLmNvbnRleHQpKTtcbiAgICAgIH0sXG5cbiAgICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoQ29tcG9uZW50LCAoMCwgX2Z1bmN0aW9ucy5hc3NpZ24pKHt9LCB0aGlzLnByb3BzLCB0aGlzLnN0YXRlKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKENvbXBvbmVudC5jb250ZXh0VHlwZXMpIHtcbiAgICAgIFN0b3JlQ29ubmVjdGlvbi5jb250ZXh0VHlwZXMgPSBDb21wb25lbnQuY29udGV4dFR5cGVzO1xuICAgIH1cblxuICAgIHJldHVybiBTdG9yZUNvbm5lY3Rpb247XG4gIH0pKCk7XG59XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGNvbm5lY3RUb1N0b3Jlcztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmlzUG9qbyA9IGlzUG9qbztcbmV4cG9ydHMuaXNQcm9taXNlID0gaXNQcm9taXNlO1xuZXhwb3J0cy5lYWNoT2JqZWN0ID0gZWFjaE9iamVjdDtcbmV4cG9ydHMuYXNzaWduID0gYXNzaWduO1xudmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbiBpc0Z1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nO1xufTtcblxuZXhwb3J0cy5pc0Z1bmN0aW9uID0gaXNGdW5jdGlvbjtcblxuZnVuY3Rpb24gaXNQb2pvKHRhcmdldCkge1xuICB2YXIgQ3RvciA9IHRhcmdldC5jb25zdHJ1Y3RvcjtcblxuICByZXR1cm4gISF0YXJnZXQgJiYgdHlwZW9mIHRhcmdldCA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRhcmdldCkgPT09ICdbb2JqZWN0IE9iamVjdF0nICYmIGlzRnVuY3Rpb24oQ3RvcikgJiYgKEN0b3IgaW5zdGFuY2VvZiBDdG9yIHx8IHRhcmdldC50eXBlID09PSAnQWx0U3RvcmUnKTtcbn1cblxuZnVuY3Rpb24gaXNQcm9taXNlKG9iaikge1xuICByZXR1cm4gISFvYmogJiYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnIHx8IHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicpICYmIHR5cGVvZiBvYmoudGhlbiA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gZWFjaE9iamVjdChmLCBvKSB7XG4gIG8uZm9yRWFjaChmdW5jdGlvbiAoZnJvbSkge1xuICAgIE9iamVjdC5rZXlzKE9iamVjdChmcm9tKSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBmKGtleSwgZnJvbVtrZXldKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGFzc2lnbih0YXJnZXQpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIHNvdXJjZSA9IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBzb3VyY2VbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgZWFjaE9iamVjdChmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgIHJldHVybiB0YXJnZXRba2V5XSA9IHZhbHVlO1xuICB9LCBzb3VyY2UpO1xuICByZXR1cm4gdGFyZ2V0O1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IG1ha2VBY3Rpb247XG5cbnZhciBfZnVuY3Rpb25zID0gcmVxdWlyZSgnLi4vZnVuY3Rpb25zJyk7XG5cbnZhciBmbiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9mdW5jdGlvbnMpO1xuXG52YXIgX0FsdFV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMvQWx0VXRpbHMnKTtcblxudmFyIHV0aWxzID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX0FsdFV0aWxzKTtcblxudmFyIF9pc1Byb21pc2UgPSByZXF1aXJlKCdpcy1wcm9taXNlJyk7XG5cbnZhciBfaXNQcm9taXNlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzUHJvbWlzZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQob2JqKSB7IGlmIChvYmogJiYgb2JqLl9fZXNNb2R1bGUpIHsgcmV0dXJuIG9iajsgfSBlbHNlIHsgdmFyIG5ld09iaiA9IHt9OyBpZiAob2JqICE9IG51bGwpIHsgZm9yICh2YXIga2V5IGluIG9iaikgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgbmV3T2JqW2tleV0gPSBvYmpba2V5XTsgfSB9IG5ld09ialsnZGVmYXVsdCddID0gb2JqOyByZXR1cm4gbmV3T2JqOyB9IH1cblxuZnVuY3Rpb24gbWFrZUFjdGlvbihhbHQsIG5hbWVzcGFjZSwgbmFtZSwgaW1wbGVtZW50YXRpb24sIG9iaikge1xuICB2YXIgaWQgPSB1dGlscy51aWQoYWx0Ll9hY3Rpb25zUmVnaXN0cnksIFN0cmluZyhuYW1lc3BhY2UpICsgJy4nICsgU3RyaW5nKG5hbWUpKTtcbiAgYWx0Ll9hY3Rpb25zUmVnaXN0cnlbaWRdID0gMTtcblxuICB2YXIgZGF0YSA9IHsgaWQ6IGlkLCBuYW1lc3BhY2U6IG5hbWVzcGFjZSwgbmFtZTogbmFtZSB9O1xuXG4gIHZhciBkaXNwYXRjaCA9IGZ1bmN0aW9uIGRpc3BhdGNoKHBheWxvYWQpIHtcbiAgICByZXR1cm4gYWx0LmRpc3BhdGNoKGlkLCBwYXlsb2FkLCBkYXRhKTtcbiAgfTtcblxuICAvLyB0aGUgYWN0aW9uIGl0c2VsZlxuICB2YXIgYWN0aW9uID0gZnVuY3Rpb24gYWN0aW9uKCkge1xuICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgIH1cblxuICAgIHZhciBpbnZvY2F0aW9uUmVzdWx0ID0gaW1wbGVtZW50YXRpb24uYXBwbHkob2JqLCBhcmdzKTtcbiAgICB2YXIgYWN0aW9uUmVzdWx0ID0gaW52b2NhdGlvblJlc3VsdDtcblxuICAgIC8vIGFzeW5jIGZ1bmN0aW9ucyB0aGF0IHJldHVybiBwcm9taXNlcyBzaG91bGQgbm90IGJlIGRpc3BhdGNoZWRcbiAgICBpZiAoaW52b2NhdGlvblJlc3VsdCAhPT0gdW5kZWZpbmVkICYmICEoMCwgX2lzUHJvbWlzZTIuZGVmYXVsdCkoaW52b2NhdGlvblJlc3VsdCkpIHtcbiAgICAgIGlmIChmbi5pc0Z1bmN0aW9uKGludm9jYXRpb25SZXN1bHQpKSB7XG4gICAgICAgIC8vIGlubmVyIGZ1bmN0aW9uIHJlc3VsdCBzaG91bGQgYmUgcmV0dXJuZWQgYXMgYW4gYWN0aW9uIHJlc3VsdFxuICAgICAgICBhY3Rpb25SZXN1bHQgPSBpbnZvY2F0aW9uUmVzdWx0KGRpc3BhdGNoLCBhbHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlzcGF0Y2goaW52b2NhdGlvblJlc3VsdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGludm9jYXRpb25SZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdXRpbHMud2FybignQW4gYWN0aW9uIHdhcyBjYWxsZWQgYnV0IG5vdGhpbmcgd2FzIGRpc3BhdGNoZWQnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWN0aW9uUmVzdWx0O1xuICB9O1xuICBhY3Rpb24uZGVmZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjIpLCBfa2V5MiA9IDA7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgIGFyZ3NbX2tleTJdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gYWN0aW9uLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH0pO1xuICB9O1xuICBhY3Rpb24uaWQgPSBpZDtcbiAgYWN0aW9uLmRhdGEgPSBkYXRhO1xuXG4gIC8vIGVuc3VyZSBlYWNoIHJlZmVyZW5jZSBpcyB1bmlxdWUgaW4gdGhlIG5hbWVzcGFjZVxuICB2YXIgY29udGFpbmVyID0gYWx0LmFjdGlvbnNbbmFtZXNwYWNlXTtcbiAgdmFyIG5hbWVzcGFjZUlkID0gdXRpbHMudWlkKGNvbnRhaW5lciwgbmFtZSk7XG4gIGNvbnRhaW5lcltuYW1lc3BhY2VJZF0gPSBhY3Rpb247XG5cbiAgLy8gZ2VuZXJhdGUgYSBjb25zdGFudFxuICB2YXIgY29uc3RhbnQgPSB1dGlscy5mb3JtYXRBc0NvbnN0YW50KG5hbWVzcGFjZUlkKTtcbiAgY29udGFpbmVyW2NvbnN0YW50XSA9IGlkO1xuXG4gIHJldHVybiBhY3Rpb247XG59XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmlzTXV0YWJsZU9iamVjdCA9IGlzTXV0YWJsZU9iamVjdDtcbmV4cG9ydHMuZWFjaE9iamVjdCA9IGVhY2hPYmplY3Q7XG5leHBvcnRzLmFzc2lnbiA9IGFzc2lnbjtcbnZhciBpc0Z1bmN0aW9uID0gZXhwb3J0cy5pc0Z1bmN0aW9uID0gZnVuY3Rpb24gaXNGdW5jdGlvbih4KSB7XG4gIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbn07XG5cbmZ1bmN0aW9uIGlzTXV0YWJsZU9iamVjdCh0YXJnZXQpIHtcbiAgdmFyIEN0b3IgPSB0YXJnZXQuY29uc3RydWN0b3I7XG5cbiAgcmV0dXJuICEhdGFyZ2V0ICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0YXJnZXQpID09PSAnW29iamVjdCBPYmplY3RdJyAmJiBpc0Z1bmN0aW9uKEN0b3IpICYmICFPYmplY3QuaXNGcm96ZW4odGFyZ2V0KSAmJiAoQ3RvciBpbnN0YW5jZW9mIEN0b3IgfHwgdGFyZ2V0LnR5cGUgPT09ICdBbHRTdG9yZScpO1xufVxuXG5mdW5jdGlvbiBlYWNoT2JqZWN0KGYsIG8pIHtcbiAgby5mb3JFYWNoKGZ1bmN0aW9uIChmcm9tKSB7XG4gICAgT2JqZWN0LmtleXMoT2JqZWN0KGZyb20pKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGYoa2V5LCBmcm9tW2tleV0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gYXNzaWduKHRhcmdldCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgc291cmNlID0gQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIHNvdXJjZVtfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICBlYWNoT2JqZWN0KGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIHRhcmdldFtrZXldID0gdmFsdWU7XG4gIH0sIHNvdXJjZSk7XG4gIHJldHVybiB0YXJnZXQ7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2ZsdXggPSByZXF1aXJlKCdmbHV4Jyk7XG5cbnZhciBfU3RhdGVGdW5jdGlvbnMgPSByZXF1aXJlKCcuL3V0aWxzL1N0YXRlRnVuY3Rpb25zJyk7XG5cbnZhciBTdGF0ZUZ1bmN0aW9ucyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9TdGF0ZUZ1bmN0aW9ucyk7XG5cbnZhciBfZnVuY3Rpb25zID0gcmVxdWlyZSgnLi9mdW5jdGlvbnMnKTtcblxudmFyIGZuID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2Z1bmN0aW9ucyk7XG5cbnZhciBfc3RvcmUgPSByZXF1aXJlKCcuL3N0b3JlJyk7XG5cbnZhciBzdG9yZSA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9zdG9yZSk7XG5cbnZhciBfQWx0VXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzL0FsdFV0aWxzJyk7XG5cbnZhciB1dGlscyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9BbHRVdGlscyk7XG5cbnZhciBfYWN0aW9ucyA9IHJlcXVpcmUoJy4vYWN0aW9ucycpO1xuXG52YXIgX2FjdGlvbnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYWN0aW9ucyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQob2JqKSB7IGlmIChvYmogJiYgb2JqLl9fZXNNb2R1bGUpIHsgcmV0dXJuIG9iajsgfSBlbHNlIHsgdmFyIG5ld09iaiA9IHt9OyBpZiAob2JqICE9IG51bGwpIHsgZm9yICh2YXIga2V5IGluIG9iaikgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgbmV3T2JqW2tleV0gPSBvYmpba2V5XTsgfSB9IG5ld09ialsnZGVmYXVsdCddID0gb2JqOyByZXR1cm4gbmV3T2JqOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfSAvKiBnbG9iYWwgd2luZG93ICovXG5cblxudmFyIEFsdCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gQWx0KCkge1xuICAgIHZhciBjb25maWcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBBbHQpO1xuXG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5zZXJpYWxpemUgPSBjb25maWcuc2VyaWFsaXplIHx8IEpTT04uc3RyaW5naWZ5O1xuICAgIHRoaXMuZGVzZXJpYWxpemUgPSBjb25maWcuZGVzZXJpYWxpemUgfHwgSlNPTi5wYXJzZTtcbiAgICB0aGlzLmRpc3BhdGNoZXIgPSBjb25maWcuZGlzcGF0Y2hlciB8fCBuZXcgX2ZsdXguRGlzcGF0Y2hlcigpO1xuICAgIHRoaXMuYmF0Y2hpbmdGdW5jdGlvbiA9IGNvbmZpZy5iYXRjaGluZ0Z1bmN0aW9uIHx8IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfTtcbiAgICB0aGlzLmFjdGlvbnMgPSB7IGdsb2JhbDoge30gfTtcbiAgICB0aGlzLnN0b3JlcyA9IHt9O1xuICAgIHRoaXMuc3RvcmVUcmFuc2Zvcm1zID0gY29uZmlnLnN0b3JlVHJhbnNmb3JtcyB8fCBbXTtcbiAgICB0aGlzLnRyYXBBc3luYyA9IGZhbHNlO1xuICAgIHRoaXMuX2FjdGlvbnNSZWdpc3RyeSA9IHt9O1xuICAgIHRoaXMuX2luaXRTbmFwc2hvdCA9IHt9O1xuICAgIHRoaXMuX2xhc3RTbmFwc2hvdCA9IHt9O1xuICB9XG5cbiAgQWx0LnByb3RvdHlwZS5kaXNwYXRjaCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBkaXNwYXRjaChhY3Rpb24sIGRhdGEsIGRldGFpbHMpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHRoaXMuYmF0Y2hpbmdGdW5jdGlvbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpZCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMTgpLnN1YnN0cigyLCAxNik7XG5cbiAgICAgICAgLy8gc3VwcG9ydCBzdHJhaWdodCBkaXNwYXRjaGluZyBvZiBGU0Etc3R5bGUgYWN0aW9uc1xuICAgICAgICBpZiAoYWN0aW9uLmhhc093blByb3BlcnR5KCd0eXBlJykgJiYgYWN0aW9uLmhhc093blByb3BlcnR5KCdwYXlsb2FkJykpIHtcbiAgICAgICAgICB2YXIgZnNhRGV0YWlscyA9IHtcbiAgICAgICAgICAgIGlkOiBhY3Rpb24udHlwZSxcbiAgICAgICAgICAgIG5hbWVzcGFjZTogYWN0aW9uLnR5cGUsXG4gICAgICAgICAgICBuYW1lOiBhY3Rpb24udHlwZVxuICAgICAgICAgIH07XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmRpc3BhdGNoZXIuZGlzcGF0Y2godXRpbHMuZnNhKGlkLCBhY3Rpb24udHlwZSwgYWN0aW9uLnBheWxvYWQsIGZzYURldGFpbHMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhY3Rpb24uaWQgJiYgYWN0aW9uLmRpc3BhdGNoKSB7XG4gICAgICAgICAgcmV0dXJuIHV0aWxzLmRpc3BhdGNoKGlkLCBhY3Rpb24sIGRhdGEsIF90aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfdGhpcy5kaXNwYXRjaGVyLmRpc3BhdGNoKHV0aWxzLmZzYShpZCwgYWN0aW9uLCBkYXRhLCBkZXRhaWxzKSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGlzcGF0Y2g7XG4gIH0oKTtcblxuICBBbHQucHJvdG90eXBlLmNyZWF0ZVVuc2F2ZWRTdG9yZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBjcmVhdGVVbnNhdmVkU3RvcmUoU3RvcmVNb2RlbCkge1xuICAgICAgdmFyIGtleSA9IFN0b3JlTW9kZWwuZGlzcGxheU5hbWUgfHwgJyc7XG4gICAgICBzdG9yZS5jcmVhdGVTdG9yZUNvbmZpZyh0aGlzLmNvbmZpZywgU3RvcmVNb2RlbCk7XG4gICAgICB2YXIgU3RvcmUgPSBzdG9yZS50cmFuc2Zvcm1TdG9yZSh0aGlzLnN0b3JlVHJhbnNmb3JtcywgU3RvcmVNb2RlbCk7XG5cbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBhcmdzW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZuLmlzRnVuY3Rpb24oU3RvcmUpID8gc3RvcmUuY3JlYXRlU3RvcmVGcm9tQ2xhc3MuYXBwbHkoc3RvcmUsIFt0aGlzLCBTdG9yZSwga2V5XS5jb25jYXQoYXJncykpIDogc3RvcmUuY3JlYXRlU3RvcmVGcm9tT2JqZWN0KHRoaXMsIFN0b3JlLCBrZXkpO1xuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVVbnNhdmVkU3RvcmU7XG4gIH0oKTtcblxuICBBbHQucHJvdG90eXBlLmNyZWF0ZVN0b3JlID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGNyZWF0ZVN0b3JlKFN0b3JlTW9kZWwsIGlkZW4pIHtcbiAgICAgIHZhciBrZXkgPSBpZGVuIHx8IFN0b3JlTW9kZWwuZGlzcGxheU5hbWUgfHwgU3RvcmVNb2RlbC5uYW1lIHx8ICcnO1xuICAgICAgc3RvcmUuY3JlYXRlU3RvcmVDb25maWcodGhpcy5jb25maWcsIFN0b3JlTW9kZWwpO1xuICAgICAgdmFyIFN0b3JlID0gc3RvcmUudHJhbnNmb3JtU3RvcmUodGhpcy5zdG9yZVRyYW5zZm9ybXMsIFN0b3JlTW9kZWwpO1xuXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgaWYgKG1vZHVsZS5ob3QpIGRlbGV0ZSB0aGlzLnN0b3Jlc1trZXldO1xuXG4gICAgICBpZiAodGhpcy5zdG9yZXNba2V5XSB8fCAha2V5KSB7XG4gICAgICAgIGlmICh0aGlzLnN0b3Jlc1trZXldKSB7XG4gICAgICAgICAgdXRpbHMud2FybignQSBzdG9yZSBuYW1lZCAnICsgU3RyaW5nKGtleSkgKyAnIGFscmVhZHkgZXhpc3RzLCBkb3VibGUgY2hlY2sgeW91ciBzdG9yZSAnICsgJ25hbWVzIG9yIHBhc3MgaW4geW91ciBvd24gY3VzdG9tIGlkZW50aWZpZXIgZm9yIGVhY2ggc3RvcmUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1dGlscy53YXJuKCdTdG9yZSBuYW1lIHdhcyBub3Qgc3BlY2lmaWVkJyk7XG4gICAgICAgIH1cblxuICAgICAgICBrZXkgPSB1dGlscy51aWQodGhpcy5zdG9yZXMsIGtleSk7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4yID4gMiA/IF9sZW4yIC0gMiA6IDApLCBfa2V5MiA9IDI7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgICAgYXJnc1tfa2V5MiAtIDJdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgICAgIH1cblxuICAgICAgdmFyIHN0b3JlSW5zdGFuY2UgPSBmbi5pc0Z1bmN0aW9uKFN0b3JlKSA/IHN0b3JlLmNyZWF0ZVN0b3JlRnJvbUNsYXNzLmFwcGx5KHN0b3JlLCBbdGhpcywgU3RvcmUsIGtleV0uY29uY2F0KGFyZ3MpKSA6IHN0b3JlLmNyZWF0ZVN0b3JlRnJvbU9iamVjdCh0aGlzLCBTdG9yZSwga2V5KTtcblxuICAgICAgdGhpcy5zdG9yZXNba2V5XSA9IHN0b3JlSW5zdGFuY2U7XG4gICAgICBTdGF0ZUZ1bmN0aW9ucy5zYXZlSW5pdGlhbFNuYXBzaG90KHRoaXMsIGtleSk7XG5cbiAgICAgIHJldHVybiBzdG9yZUluc3RhbmNlO1xuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVTdG9yZTtcbiAgfSgpO1xuXG4gIEFsdC5wcm90b3R5cGUuZ2VuZXJhdGVBY3Rpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGdlbmVyYXRlQWN0aW9ucygpIHtcbiAgICAgIHZhciBhY3Rpb25zID0geyBuYW1lOiAnZ2xvYmFsJyB9O1xuXG4gICAgICBmb3IgKHZhciBfbGVuMyA9IGFyZ3VtZW50cy5sZW5ndGgsIGFjdGlvbk5hbWVzID0gQXJyYXkoX2xlbjMpLCBfa2V5MyA9IDA7IF9rZXkzIDwgX2xlbjM7IF9rZXkzKyspIHtcbiAgICAgICAgYWN0aW9uTmFtZXNbX2tleTNdID0gYXJndW1lbnRzW19rZXkzXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQWN0aW9ucyhhY3Rpb25OYW1lcy5yZWR1Y2UoZnVuY3Rpb24gKG9iaiwgYWN0aW9uKSB7XG4gICAgICAgIG9ialthY3Rpb25dID0gdXRpbHMuZGlzcGF0Y2hJZGVudGl0eTtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH0sIGFjdGlvbnMpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2VuZXJhdGVBY3Rpb25zO1xuICB9KCk7XG5cbiAgQWx0LnByb3RvdHlwZS5jcmVhdGVBY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gY3JlYXRlQWN0aW9uKG5hbWUsIGltcGxlbWVudGF0aW9uLCBvYmopIHtcbiAgICAgIHJldHVybiAoMCwgX2FjdGlvbnMyLmRlZmF1bHQpKHRoaXMsICdnbG9iYWwnLCBuYW1lLCBpbXBsZW1lbnRhdGlvbiwgb2JqKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlQWN0aW9uO1xuICB9KCk7XG5cbiAgQWx0LnByb3RvdHlwZS5jcmVhdGVBY3Rpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGNyZWF0ZUFjdGlvbnMoQWN0aW9uc0NsYXNzKSB7XG4gICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgdmFyIGV4cG9ydE9iaiA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgICB2YXIgYWN0aW9ucyA9IHt9O1xuICAgICAgdmFyIGtleSA9IHV0aWxzLnVpZCh0aGlzLl9hY3Rpb25zUmVnaXN0cnksIEFjdGlvbnNDbGFzcy5kaXNwbGF5TmFtZSB8fCBBY3Rpb25zQ2xhc3MubmFtZSB8fCAnVW5rbm93bicpO1xuXG4gICAgICBpZiAoZm4uaXNGdW5jdGlvbihBY3Rpb25zQ2xhc3MpKSB7XG4gICAgICAgIGZuLmFzc2lnbihhY3Rpb25zLCB1dGlscy5nZXRQcm90b3R5cGVDaGFpbihBY3Rpb25zQ2xhc3MpKTtcblxuICAgICAgICB2YXIgQWN0aW9uc0dlbmVyYXRvciA9IGZ1bmN0aW9uIChfQWN0aW9uc0NsYXNzKSB7XG4gICAgICAgICAgX2luaGVyaXRzKEFjdGlvbnNHZW5lcmF0b3IsIF9BY3Rpb25zQ2xhc3MpO1xuXG4gICAgICAgICAgZnVuY3Rpb24gQWN0aW9uc0dlbmVyYXRvcigpIHtcbiAgICAgICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBBY3Rpb25zR2VuZXJhdG9yKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgX2xlbjUgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjUpLCBfa2V5NSA9IDA7IF9rZXk1IDwgX2xlbjU7IF9rZXk1KyspIHtcbiAgICAgICAgICAgICAgYXJnc1tfa2V5NV0gPSBhcmd1bWVudHNbX2tleTVdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgX0FjdGlvbnNDbGFzcy5jYWxsLmFwcGx5KF9BY3Rpb25zQ2xhc3MsIFt0aGlzXS5jb25jYXQoYXJncykpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBBY3Rpb25zR2VuZXJhdG9yLnByb3RvdHlwZS5nZW5lcmF0ZUFjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZUFjdGlvbnMoKSB7XG4gICAgICAgICAgICAgIGZvciAodmFyIF9sZW42ID0gYXJndW1lbnRzLmxlbmd0aCwgYWN0aW9uTmFtZXMgPSBBcnJheShfbGVuNiksIF9rZXk2ID0gMDsgX2tleTYgPCBfbGVuNjsgX2tleTYrKykge1xuICAgICAgICAgICAgICAgIGFjdGlvbk5hbWVzW19rZXk2XSA9IGFyZ3VtZW50c1tfa2V5Nl07XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBhY3Rpb25OYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChhY3Rpb25OYW1lKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uc1thY3Rpb25OYW1lXSA9IHV0aWxzLmRpc3BhdGNoSWRlbnRpdHk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZ2VuZXJhdGVBY3Rpb25zO1xuICAgICAgICAgIH0oKTtcblxuICAgICAgICAgIHJldHVybiBBY3Rpb25zR2VuZXJhdG9yO1xuICAgICAgICB9KEFjdGlvbnNDbGFzcyk7XG5cbiAgICAgICAgZm9yICh2YXIgX2xlbjQgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzRm9yQ29uc3RydWN0b3IgPSBBcnJheShfbGVuNCA+IDIgPyBfbGVuNCAtIDIgOiAwKSwgX2tleTQgPSAyOyBfa2V5NCA8IF9sZW40OyBfa2V5NCsrKSB7XG4gICAgICAgICAgYXJnc0ZvckNvbnN0cnVjdG9yW19rZXk0IC0gMl0gPSBhcmd1bWVudHNbX2tleTRdO1xuICAgICAgICB9XG5cbiAgICAgICAgZm4uYXNzaWduKGFjdGlvbnMsIG5ldyAoRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuYXBwbHkoQWN0aW9uc0dlbmVyYXRvciwgW251bGxdLmNvbmNhdChhcmdzRm9yQ29uc3RydWN0b3IpKSkoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmbi5hc3NpZ24oYWN0aW9ucywgQWN0aW9uc0NsYXNzKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hY3Rpb25zW2tleV0gPSB0aGlzLmFjdGlvbnNba2V5XSB8fCB7fTtcblxuICAgICAgZm4uZWFjaE9iamVjdChmdW5jdGlvbiAoYWN0aW9uTmFtZSwgYWN0aW9uKSB7XG4gICAgICAgIGlmICghZm4uaXNGdW5jdGlvbihhY3Rpb24pKSB7XG4gICAgICAgICAgZXhwb3J0T2JqW2FjdGlvbk5hbWVdID0gYWN0aW9uO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNyZWF0ZSB0aGUgYWN0aW9uXG4gICAgICAgIGV4cG9ydE9ialthY3Rpb25OYW1lXSA9ICgwLCBfYWN0aW9uczIuZGVmYXVsdCkoX3RoaXMzLCBrZXksIGFjdGlvbk5hbWUsIGFjdGlvbiwgZXhwb3J0T2JqKTtcblxuICAgICAgICAvLyBnZW5lcmF0ZSBhIGNvbnN0YW50XG4gICAgICAgIHZhciBjb25zdGFudCA9IHV0aWxzLmZvcm1hdEFzQ29uc3RhbnQoYWN0aW9uTmFtZSk7XG4gICAgICAgIGV4cG9ydE9ialtjb25zdGFudF0gPSBleHBvcnRPYmpbYWN0aW9uTmFtZV0uaWQ7XG4gICAgICB9LCBbYWN0aW9uc10pO1xuXG4gICAgICByZXR1cm4gZXhwb3J0T2JqO1xuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVBY3Rpb25zO1xuICB9KCk7XG5cbiAgQWx0LnByb3RvdHlwZS50YWtlU25hcHNob3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gdGFrZVNuYXBzaG90KCkge1xuICAgICAgZm9yICh2YXIgX2xlbjcgPSBhcmd1bWVudHMubGVuZ3RoLCBzdG9yZU5hbWVzID0gQXJyYXkoX2xlbjcpLCBfa2V5NyA9IDA7IF9rZXk3IDwgX2xlbjc7IF9rZXk3KyspIHtcbiAgICAgICAgc3RvcmVOYW1lc1tfa2V5N10gPSBhcmd1bWVudHNbX2tleTddO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3RhdGUgPSBTdGF0ZUZ1bmN0aW9ucy5zbmFwc2hvdCh0aGlzLCBzdG9yZU5hbWVzKTtcbiAgICAgIGZuLmFzc2lnbih0aGlzLl9sYXN0U25hcHNob3QsIHN0YXRlKTtcbiAgICAgIHJldHVybiB0aGlzLnNlcmlhbGl6ZShzdGF0ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRha2VTbmFwc2hvdDtcbiAgfSgpO1xuXG4gIEFsdC5wcm90b3R5cGUucm9sbGJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gcm9sbGJhY2soKSB7XG4gICAgICBTdGF0ZUZ1bmN0aW9ucy5zZXRBcHBTdGF0ZSh0aGlzLCB0aGlzLnNlcmlhbGl6ZSh0aGlzLl9sYXN0U25hcHNob3QpLCBmdW5jdGlvbiAoc3RvcmVJbnN0KSB7XG4gICAgICAgIHN0b3JlSW5zdC5saWZlY3ljbGUoJ3JvbGxiYWNrJyk7XG4gICAgICAgIHN0b3JlSW5zdC5lbWl0Q2hhbmdlKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcm9sbGJhY2s7XG4gIH0oKTtcblxuICBBbHQucHJvdG90eXBlLnJlY3ljbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gcmVjeWNsZSgpIHtcbiAgICAgIGZvciAodmFyIF9sZW44ID0gYXJndW1lbnRzLmxlbmd0aCwgc3RvcmVOYW1lcyA9IEFycmF5KF9sZW44KSwgX2tleTggPSAwOyBfa2V5OCA8IF9sZW44OyBfa2V5OCsrKSB7XG4gICAgICAgIHN0b3JlTmFtZXNbX2tleThdID0gYXJndW1lbnRzW19rZXk4XTtcbiAgICAgIH1cblxuICAgICAgdmFyIGluaXRpYWxTbmFwc2hvdCA9IHN0b3JlTmFtZXMubGVuZ3RoID8gU3RhdGVGdW5jdGlvbnMuZmlsdGVyU25hcHNob3RzKHRoaXMsIHRoaXMuX2luaXRTbmFwc2hvdCwgc3RvcmVOYW1lcykgOiB0aGlzLl9pbml0U25hcHNob3Q7XG5cbiAgICAgIFN0YXRlRnVuY3Rpb25zLnNldEFwcFN0YXRlKHRoaXMsIHRoaXMuc2VyaWFsaXplKGluaXRpYWxTbmFwc2hvdCksIGZ1bmN0aW9uIChzdG9yZUluc3QpIHtcbiAgICAgICAgc3RvcmVJbnN0LmxpZmVjeWNsZSgnaW5pdCcpO1xuICAgICAgICBzdG9yZUluc3QuZW1pdENoYW5nZSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlY3ljbGU7XG4gIH0oKTtcblxuICBBbHQucHJvdG90eXBlLmZsdXNoID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGZsdXNoKCkge1xuICAgICAgdmFyIHN0YXRlID0gdGhpcy5zZXJpYWxpemUoU3RhdGVGdW5jdGlvbnMuc25hcHNob3QodGhpcykpO1xuICAgICAgdGhpcy5yZWN5Y2xlKCk7XG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZsdXNoO1xuICB9KCk7XG5cbiAgQWx0LnByb3RvdHlwZS5ib290c3RyYXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gYm9vdHN0cmFwKGRhdGEpIHtcbiAgICAgIFN0YXRlRnVuY3Rpb25zLnNldEFwcFN0YXRlKHRoaXMsIGRhdGEsIGZ1bmN0aW9uIChzdG9yZUluc3QsIHN0YXRlKSB7XG4gICAgICAgIHN0b3JlSW5zdC5saWZlY3ljbGUoJ2Jvb3RzdHJhcCcsIHN0YXRlKTtcbiAgICAgICAgc3RvcmVJbnN0LmVtaXRDaGFuZ2UoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBib290c3RyYXA7XG4gIH0oKTtcblxuICBBbHQucHJvdG90eXBlLnByZXBhcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gcHJlcGFyZShzdG9yZUluc3QsIHBheWxvYWQpIHtcbiAgICAgIHZhciBkYXRhID0ge307XG4gICAgICBpZiAoIXN0b3JlSW5zdC5kaXNwbGF5TmFtZSkge1xuICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoJ1N0b3JlIHByb3ZpZGVkIGRvZXMgbm90IGhhdmUgYSBuYW1lJyk7XG4gICAgICB9XG4gICAgICBkYXRhW3N0b3JlSW5zdC5kaXNwbGF5TmFtZV0gPSBwYXlsb2FkO1xuICAgICAgcmV0dXJuIHRoaXMuc2VyaWFsaXplKGRhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiBwcmVwYXJlO1xuICB9KCk7XG5cbiAgLy8gSW5zdGFuY2UgdHlwZSBtZXRob2RzIGZvciBpbmplY3RpbmcgYWx0IGludG8geW91ciBhcHBsaWNhdGlvbiBhcyBjb250ZXh0XG5cbiAgQWx0LnByb3RvdHlwZS5hZGRBY3Rpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGFkZEFjdGlvbnMobmFtZSwgQWN0aW9uc0NsYXNzKSB7XG4gICAgICBmb3IgKHZhciBfbGVuOSA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuOSA+IDIgPyBfbGVuOSAtIDIgOiAwKSwgX2tleTkgPSAyOyBfa2V5OSA8IF9sZW45OyBfa2V5OSsrKSB7XG4gICAgICAgIGFyZ3NbX2tleTkgLSAyXSA9IGFyZ3VtZW50c1tfa2V5OV07XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYWN0aW9uc1tuYW1lXSA9IEFycmF5LmlzQXJyYXkoQWN0aW9uc0NsYXNzKSA/IHRoaXMuZ2VuZXJhdGVBY3Rpb25zLmFwcGx5KHRoaXMsIEFjdGlvbnNDbGFzcykgOiB0aGlzLmNyZWF0ZUFjdGlvbnMuYXBwbHkodGhpcywgW0FjdGlvbnNDbGFzc10uY29uY2F0KGFyZ3MpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWRkQWN0aW9ucztcbiAgfSgpO1xuXG4gIEFsdC5wcm90b3R5cGUuYWRkU3RvcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gYWRkU3RvcmUobmFtZSwgU3RvcmVNb2RlbCkge1xuICAgICAgZm9yICh2YXIgX2xlbjEwID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4xMCA+IDIgPyBfbGVuMTAgLSAyIDogMCksIF9rZXkxMCA9IDI7IF9rZXkxMCA8IF9sZW4xMDsgX2tleTEwKyspIHtcbiAgICAgICAgYXJnc1tfa2V5MTAgLSAyXSA9IGFyZ3VtZW50c1tfa2V5MTBdO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNyZWF0ZVN0b3JlLmFwcGx5KHRoaXMsIFtTdG9yZU1vZGVsLCBuYW1lXS5jb25jYXQoYXJncykpO1xuICAgIH1cblxuICAgIHJldHVybiBhZGRTdG9yZTtcbiAgfSgpO1xuXG4gIEFsdC5wcm90b3R5cGUuZ2V0QWN0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBnZXRBY3Rpb25zKG5hbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLmFjdGlvbnNbbmFtZV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldEFjdGlvbnM7XG4gIH0oKTtcblxuICBBbHQucHJvdG90eXBlLmdldFN0b3JlID0gZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGdldFN0b3JlKG5hbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0b3Jlc1tuYW1lXTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0U3RvcmU7XG4gIH0oKTtcblxuICBBbHQuZGVidWcgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gZGVidWcobmFtZSwgYWx0LCB3aW4pIHtcbiAgICAgIHZhciBrZXkgPSAnYWx0LmpzLm9yZyc7XG4gICAgICB2YXIgY29udGV4dCA9IHdpbjtcbiAgICAgIGlmICghY29udGV4dCAmJiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb250ZXh0ID0gd2luZG93O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBjb250ZXh0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb250ZXh0W2tleV0gPSBjb250ZXh0W2tleV0gfHwgW107XG4gICAgICAgIGNvbnRleHRba2V5XS5wdXNoKHsgbmFtZTogbmFtZSwgYWx0OiBhbHQgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYWx0O1xuICAgIH1cblxuICAgIHJldHVybiBkZWJ1ZztcbiAgfSgpO1xuXG4gIHJldHVybiBBbHQ7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEFsdDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9mdW5jdGlvbnMgPSByZXF1aXJlKCcuLi9mdW5jdGlvbnMnKTtcblxudmFyIGZuID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2Z1bmN0aW9ucyk7XG5cbnZhciBfdHJhbnNtaXR0ZXIgPSByZXF1aXJlKCd0cmFuc21pdHRlcicpO1xuXG52YXIgX3RyYW5zbWl0dGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3RyYW5zbWl0dGVyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHsgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkgeyByZXR1cm4gb2JqOyB9IGVsc2UgeyB2YXIgbmV3T2JqID0ge307IGlmIChvYmogIT0gbnVsbCkgeyBmb3IgKHZhciBrZXkgaW4gb2JqKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldOyB9IH0gbmV3T2JqWydkZWZhdWx0J10gPSBvYmo7IHJldHVybiBuZXdPYmo7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgQWx0U3RvcmUgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIEFsdFN0b3JlKGFsdCwgbW9kZWwsIHN0YXRlLCBTdG9yZU1vZGVsKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBBbHRTdG9yZSk7XG5cbiAgICB2YXIgbGlmZWN5Y2xlRXZlbnRzID0gbW9kZWwubGlmZWN5Y2xlRXZlbnRzO1xuICAgIHRoaXMudHJhbnNtaXR0ZXIgPSAoMCwgX3RyYW5zbWl0dGVyMi5kZWZhdWx0KSgpO1xuICAgIHRoaXMubGlmZWN5Y2xlID0gZnVuY3Rpb24gKGV2ZW50LCB4KSB7XG4gICAgICBpZiAobGlmZWN5Y2xlRXZlbnRzW2V2ZW50XSkgbGlmZWN5Y2xlRXZlbnRzW2V2ZW50XS5wdXNoKHgpO1xuICAgIH07XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuXG4gICAgdGhpcy5hbHQgPSBhbHQ7XG4gICAgdGhpcy5wcmV2ZW50RGVmYXVsdCA9IGZhbHNlO1xuICAgIHRoaXMuZGlzcGxheU5hbWUgPSBtb2RlbC5kaXNwbGF5TmFtZTtcbiAgICB0aGlzLmJvdW5kTGlzdGVuZXJzID0gbW9kZWwuYm91bmRMaXN0ZW5lcnM7XG4gICAgdGhpcy5TdG9yZU1vZGVsID0gU3RvcmVNb2RlbDtcbiAgICB0aGlzLnJlZHVjZSA9IG1vZGVsLnJlZHVjZSB8fCBmdW5jdGlvbiAoeCkge1xuICAgICAgcmV0dXJuIHg7XG4gICAgfTtcblxuICAgIHZhciBvdXRwdXQgPSBtb2RlbC5vdXRwdXQgfHwgZnVuY3Rpb24gKHgpIHtcbiAgICAgIHJldHVybiB4O1xuICAgIH07XG5cbiAgICB0aGlzLmVtaXRDaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gX3RoaXMudHJhbnNtaXR0ZXIucHVzaChvdXRwdXQoX3RoaXMuc3RhdGUpKTtcbiAgICB9O1xuXG4gICAgdmFyIGhhbmRsZURpc3BhdGNoID0gZnVuY3Rpb24gaGFuZGxlRGlzcGF0Y2goZiwgcGF5bG9hZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGYoKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKG1vZGVsLmhhbmRsZXNPd25FcnJvcnMpIHtcbiAgICAgICAgICBfdGhpcy5saWZlY3ljbGUoJ2Vycm9yJywge1xuICAgICAgICAgICAgZXJyb3I6IGUsXG4gICAgICAgICAgICBwYXlsb2FkOiBwYXlsb2FkLFxuICAgICAgICAgICAgc3RhdGU6IF90aGlzLnN0YXRlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZm4uYXNzaWduKHRoaXMsIG1vZGVsLnB1YmxpY01ldGhvZHMpO1xuXG4gICAgLy8gUmVnaXN0ZXIgZGlzcGF0Y2hlclxuICAgIHRoaXMuZGlzcGF0Y2hUb2tlbiA9IGFsdC5kaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgICBfdGhpcy5wcmV2ZW50RGVmYXVsdCA9IGZhbHNlO1xuXG4gICAgICBfdGhpcy5saWZlY3ljbGUoJ2JlZm9yZUVhY2gnLCB7XG4gICAgICAgIHBheWxvYWQ6IHBheWxvYWQsXG4gICAgICAgIHN0YXRlOiBfdGhpcy5zdGF0ZVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBhY3Rpb25IYW5kbGVycyA9IG1vZGVsLmFjdGlvbkxpc3RlbmVyc1twYXlsb2FkLmFjdGlvbl07XG5cbiAgICAgIGlmIChhY3Rpb25IYW5kbGVycyB8fCBtb2RlbC5vdGhlcndpc2UpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHZvaWQgMDtcblxuICAgICAgICBpZiAoYWN0aW9uSGFuZGxlcnMpIHtcbiAgICAgICAgICByZXN1bHQgPSBoYW5kbGVEaXNwYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYWN0aW9uSGFuZGxlcnMuZmlsdGVyKEJvb2xlYW4pLmV2ZXJ5KGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyLmNhbGwobW9kZWwsIHBheWxvYWQuZGF0YSwgcGF5bG9hZC5hY3Rpb24pICE9PSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sIHBheWxvYWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdCA9IGhhbmRsZURpc3BhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5vdGhlcndpc2UocGF5bG9hZC5kYXRhLCBwYXlsb2FkLmFjdGlvbik7XG4gICAgICAgICAgfSwgcGF5bG9hZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0ICE9PSBmYWxzZSAmJiAhX3RoaXMucHJldmVudERlZmF1bHQpIF90aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1vZGVsLnJlZHVjZSkge1xuICAgICAgICBoYW5kbGVEaXNwYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIHZhbHVlID0gbW9kZWwucmVkdWNlKF90aGlzLnN0YXRlLCBwYXlsb2FkKTtcbiAgICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkgX3RoaXMuc3RhdGUgPSB2YWx1ZTtcbiAgICAgICAgfSwgcGF5bG9hZCk7XG4gICAgICAgIGlmICghX3RoaXMucHJldmVudERlZmF1bHQpIF90aGlzLmVtaXRDaGFuZ2UoKTtcbiAgICAgIH1cblxuICAgICAgX3RoaXMubGlmZWN5Y2xlKCdhZnRlckVhY2gnLCB7XG4gICAgICAgIHBheWxvYWQ6IHBheWxvYWQsXG4gICAgICAgIHN0YXRlOiBfdGhpcy5zdGF0ZVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmxpZmVjeWNsZSgnaW5pdCcpO1xuICB9XG5cbiAgQWx0U3RvcmUucHJvdG90eXBlLmxpc3RlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBsaXN0ZW4oY2IpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICBpZiAoIWZuLmlzRnVuY3Rpb24oY2IpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdsaXN0ZW4gZXhwZWN0cyBhIGZ1bmN0aW9uJyk7XG4gICAgICB0aGlzLnRyYW5zbWl0dGVyLnN1YnNjcmliZShjYik7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX3RoaXMyLnVubGlzdGVuKGNiKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpc3RlbjtcbiAgfSgpO1xuXG4gIEFsdFN0b3JlLnByb3RvdHlwZS51bmxpc3RlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiB1bmxpc3RlbihjYikge1xuICAgICAgdGhpcy5saWZlY3ljbGUoJ3VubGlzdGVuJyk7XG4gICAgICB0aGlzLnRyYW5zbWl0dGVyLnVuc3Vic2NyaWJlKGNiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdW5saXN0ZW47XG4gIH0oKTtcblxuICBBbHRTdG9yZS5wcm90b3R5cGUuZ2V0U3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gZ2V0U3RhdGUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5TdG9yZU1vZGVsLmNvbmZpZy5nZXRTdGF0ZS5jYWxsKHRoaXMsIHRoaXMuc3RhdGUpO1xuICAgIH1cblxuICAgIHJldHVybiBnZXRTdGF0ZTtcbiAgfSgpO1xuXG4gIHJldHVybiBBbHRTdG9yZTtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gQWx0U3RvcmU7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfdHJhbnNtaXR0ZXIgPSByZXF1aXJlKCd0cmFuc21pdHRlcicpO1xuXG52YXIgX3RyYW5zbWl0dGVyMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3RyYW5zbWl0dGVyKTtcblxudmFyIF9mdW5jdGlvbnMgPSByZXF1aXJlKCcuLi9mdW5jdGlvbnMnKTtcblxudmFyIGZuID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2Z1bmN0aW9ucyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKG9iaikgeyBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7IHJldHVybiBvYmo7IH0gZWxzZSB7IHZhciBuZXdPYmogPSB7fTsgaWYgKG9iaiAhPSBudWxsKSB7IGZvciAodmFyIGtleSBpbiBvYmopIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIG5ld09ialtrZXldID0gb2JqW2tleV07IH0gfSBuZXdPYmpbJ2RlZmF1bHQnXSA9IG9iajsgcmV0dXJuIG5ld09iajsgfSB9XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIFN0b3JlTWl4aW4gPSB7XG4gIHdhaXRGb3I6IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiB3YWl0Rm9yKCkge1xuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIHNvdXJjZXMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgc291cmNlc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFzb3VyY2VzLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoJ0Rpc3BhdGNoIHRva2VucyBub3QgcHJvdmlkZWQnKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHNvdXJjZXNBcnJheSA9IHNvdXJjZXM7XG4gICAgICBpZiAoc291cmNlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgc291cmNlc0FycmF5ID0gQXJyYXkuaXNBcnJheShzb3VyY2VzWzBdKSA/IHNvdXJjZXNbMF0gOiBzb3VyY2VzO1xuICAgICAgfVxuXG4gICAgICB2YXIgdG9rZW5zID0gc291cmNlc0FycmF5Lm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICAgIHJldHVybiBzb3VyY2UuZGlzcGF0Y2hUb2tlbiB8fCBzb3VyY2U7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5kaXNwYXRjaGVyLndhaXRGb3IodG9rZW5zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gd2FpdEZvcjtcbiAgfSgpLFxuICBleHBvcnRBc3luYzogZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGV4cG9ydEFzeW5jKGFzeW5jTWV0aG9kcykge1xuICAgICAgdGhpcy5yZWdpc3RlckFzeW5jKGFzeW5jTWV0aG9kcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4cG9ydEFzeW5jO1xuICB9KCksXG4gIHJlZ2lzdGVyQXN5bmM6IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiByZWdpc3RlckFzeW5jKGFzeW5jRGVmKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgbG9hZENvdW50ZXIgPSAwO1xuXG4gICAgICB2YXIgYXN5bmNNZXRob2RzID0gZm4uaXNGdW5jdGlvbihhc3luY0RlZikgPyBhc3luY0RlZih0aGlzLmFsdCkgOiBhc3luY0RlZjtcblxuICAgICAgdmFyIHRvRXhwb3J0ID0gT2JqZWN0LmtleXMoYXN5bmNNZXRob2RzKS5yZWR1Y2UoZnVuY3Rpb24gKHB1YmxpY01ldGhvZHMsIG1ldGhvZE5hbWUpIHtcbiAgICAgICAgdmFyIGRlc2MgPSBhc3luY01ldGhvZHNbbWV0aG9kTmFtZV07XG4gICAgICAgIHZhciBzcGVjID0gZm4uaXNGdW5jdGlvbihkZXNjKSA/IGRlc2MoX3RoaXMpIDogZGVzYztcblxuICAgICAgICB2YXIgdmFsaWRIYW5kbGVycyA9IFsnc3VjY2VzcycsICdlcnJvcicsICdsb2FkaW5nJ107XG4gICAgICAgIHZhbGlkSGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgICAgIGlmIChzcGVjW2hhbmRsZXJdICYmICFzcGVjW2hhbmRsZXJdLmlkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoU3RyaW5nKGhhbmRsZXIpICsgJyBoYW5kbGVyIG11c3QgYmUgYW4gYWN0aW9uIGZ1bmN0aW9uJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBwdWJsaWNNZXRob2RzW21ldGhvZE5hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4yKSwgX2tleTIgPSAwOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICAgICAgICBhcmdzW19rZXkyXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIHN0YXRlID0gX3RoaXMuZ2V0SW5zdGFuY2UoKS5nZXRTdGF0ZSgpO1xuICAgICAgICAgIHZhciB2YWx1ZSA9IHNwZWMubG9jYWwgJiYgc3BlYy5sb2NhbC5hcHBseShzcGVjLCBbc3RhdGVdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgdmFyIHNob3VsZEZldGNoID0gc3BlYy5zaG91bGRGZXRjaCA/IHNwZWMuc2hvdWxkRmV0Y2guYXBwbHkoc3BlYywgW3N0YXRlXS5jb25jYXQoYXJncykpXG4gICAgICAgICAgLyplc2xpbnQtZGlzYWJsZSovXG4gICAgICAgICAgOiB2YWx1ZSA9PSBudWxsO1xuICAgICAgICAgIC8qZXNsaW50LWVuYWJsZSovXG4gICAgICAgICAgdmFyIGludGVyY2VwdCA9IHNwZWMuaW50ZXJjZXB0UmVzcG9uc2UgfHwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICB2YXIgbWFrZUFjdGlvbkhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBtYWtlQWN0aW9uSGFuZGxlcihhY3Rpb24sIGlzRXJyb3IpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGZpcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICBmdW5jdGlvbiBmaXJlKCkge1xuICAgICAgICAgICAgICAgICAgICBsb2FkQ291bnRlciAtPSAxO1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb24oaW50ZXJjZXB0KHgsIGFjdGlvbiwgYXJncykpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNFcnJvcikgdGhyb3cgeDtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpcmU7XG4gICAgICAgICAgICAgICAgfSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5hbHQudHJhcEFzeW5jID8gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpcmUoKTtcbiAgICAgICAgICAgICAgICB9IDogZmlyZSgpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbWFrZUFjdGlvbkhhbmRsZXI7XG4gICAgICAgICAgfSgpO1xuXG4gICAgICAgICAgLy8gaWYgd2UgZG9uJ3QgaGF2ZSBpdCBpbiBjYWNoZSB0aGVuIGZldGNoIGl0XG4gICAgICAgICAgaWYgKHNob3VsZEZldGNoKSB7XG4gICAgICAgICAgICBsb2FkQ291bnRlciArPSAxO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgICAgICAgIGlmIChzcGVjLmxvYWRpbmcpIHNwZWMubG9hZGluZyhpbnRlcmNlcHQobnVsbCwgc3BlYy5sb2FkaW5nLCBhcmdzKSk7XG4gICAgICAgICAgICByZXR1cm4gc3BlYy5yZW1vdGUuYXBwbHkoc3BlYywgW3N0YXRlXS5jb25jYXQoYXJncykpLnRoZW4obWFrZUFjdGlvbkhhbmRsZXIoc3BlYy5zdWNjZXNzKSwgbWFrZUFjdGlvbkhhbmRsZXIoc3BlYy5lcnJvciwgMSkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIG90aGVyd2lzZSBlbWl0IHRoZSBjaGFuZ2Ugbm93XG4gICAgICAgICAgX3RoaXMuZW1pdENoYW5nZSgpO1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gcHVibGljTWV0aG9kcztcbiAgICAgIH0sIHt9KTtcblxuICAgICAgdGhpcy5leHBvcnRQdWJsaWNNZXRob2RzKHRvRXhwb3J0KTtcbiAgICAgIHRoaXMuZXhwb3J0UHVibGljTWV0aG9kcyh7XG4gICAgICAgIGlzTG9hZGluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGZ1bmN0aW9uIGlzTG9hZGluZygpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2FkQ291bnRlciA+IDA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGlzTG9hZGluZztcbiAgICAgICAgfSgpXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVnaXN0ZXJBc3luYztcbiAgfSgpLFxuICBleHBvcnRQdWJsaWNNZXRob2RzOiBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gZXhwb3J0UHVibGljTWV0aG9kcyhtZXRob2RzKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgZm4uZWFjaE9iamVjdChmdW5jdGlvbiAobWV0aG9kTmFtZSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKCFmbi5pc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4cG9ydFB1YmxpY01ldGhvZHMgZXhwZWN0cyBhIGZ1bmN0aW9uJyk7XG4gICAgICAgIH1cblxuICAgICAgICBfdGhpczIucHVibGljTWV0aG9kc1ttZXRob2ROYW1lXSA9IHZhbHVlO1xuICAgICAgfSwgW21ldGhvZHNdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZXhwb3J0UHVibGljTWV0aG9kcztcbiAgfSgpLFxuICBlbWl0Q2hhbmdlOiBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gZW1pdENoYW5nZSgpIHtcbiAgICAgIHRoaXMuZ2V0SW5zdGFuY2UoKS5lbWl0Q2hhbmdlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVtaXRDaGFuZ2U7XG4gIH0oKSxcbiAgb246IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBvbihsaWZlY3ljbGVFdmVudCwgaGFuZGxlcikge1xuICAgICAgaWYgKGxpZmVjeWNsZUV2ZW50ID09PSAnZXJyb3InKSB0aGlzLmhhbmRsZXNPd25FcnJvcnMgPSB0cnVlO1xuICAgICAgdmFyIGJ1cyA9IHRoaXMubGlmZWN5Y2xlRXZlbnRzW2xpZmVjeWNsZUV2ZW50XSB8fCAoMCwgX3RyYW5zbWl0dGVyMi5kZWZhdWx0KSgpO1xuICAgICAgdGhpcy5saWZlY3ljbGVFdmVudHNbbGlmZWN5Y2xlRXZlbnRdID0gYnVzO1xuICAgICAgcmV0dXJuIGJ1cy5zdWJzY3JpYmUoaGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb247XG4gIH0oKSxcbiAgYmluZEFjdGlvbjogZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGJpbmRBY3Rpb24oc3ltYm9sLCBoYW5kbGVyKSB7XG4gICAgICBpZiAoIXN5bWJvbCkge1xuICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoJ0ludmFsaWQgYWN0aW9uIHJlZmVyZW5jZSBwYXNzZWQgaW4nKTtcbiAgICAgIH1cbiAgICAgIGlmICghZm4uaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdiaW5kQWN0aW9uIGV4cGVjdHMgYSBmdW5jdGlvbicpO1xuICAgICAgfVxuXG4gICAgICAvLyBZb3UgY2FuIHBhc3MgaW4gdGhlIGNvbnN0YW50IG9yIHRoZSBmdW5jdGlvbiBpdHNlbGZcbiAgICAgIHZhciBrZXkgPSBzeW1ib2wuaWQgPyBzeW1ib2wuaWQgOiBzeW1ib2w7XG4gICAgICB0aGlzLmFjdGlvbkxpc3RlbmVyc1trZXldID0gdGhpcy5hY3Rpb25MaXN0ZW5lcnNba2V5XSB8fCBbXTtcbiAgICAgIHRoaXMuYWN0aW9uTGlzdGVuZXJzW2tleV0ucHVzaChoYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgdGhpcy5ib3VuZExpc3RlbmVycy5wdXNoKGtleSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJpbmRBY3Rpb247XG4gIH0oKSxcbiAgYmluZEFjdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBiaW5kQWN0aW9ucyhhY3Rpb25zKSB7XG4gICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgZm4uZWFjaE9iamVjdChmdW5jdGlvbiAoYWN0aW9uLCBzeW1ib2wpIHtcbiAgICAgICAgdmFyIG1hdGNoRmlyc3RDaGFyYWN0ZXIgPSAvLi87XG4gICAgICAgIHZhciBhc3N1bWVkRXZlbnRIYW5kbGVyID0gYWN0aW9uLnJlcGxhY2UobWF0Y2hGaXJzdENoYXJhY3RlciwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICByZXR1cm4gJ29uJyArIFN0cmluZyh4WzBdLnRvVXBwZXJDYXNlKCkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoX3RoaXMzW2FjdGlvbl0gJiYgX3RoaXMzW2Fzc3VtZWRFdmVudEhhbmRsZXJdKSB7XG4gICAgICAgICAgLy8gSWYgeW91IGhhdmUgYm90aCBhY3Rpb24gYW5kIG9uQWN0aW9uXG4gICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCdZb3UgaGF2ZSBtdWx0aXBsZSBhY3Rpb24gaGFuZGxlcnMgYm91bmQgdG8gYW4gYWN0aW9uOiAnICsgKFN0cmluZyhhY3Rpb24pICsgJyBhbmQgJyArIFN0cmluZyhhc3N1bWVkRXZlbnRIYW5kbGVyKSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGhhbmRsZXIgPSBfdGhpczNbYWN0aW9uXSB8fCBfdGhpczNbYXNzdW1lZEV2ZW50SGFuZGxlcl07XG4gICAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgICAgX3RoaXMzLmJpbmRBY3Rpb24oc3ltYm9sLCBoYW5kbGVyKTtcbiAgICAgICAgfVxuICAgICAgfSwgW2FjdGlvbnNdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYmluZEFjdGlvbnM7XG4gIH0oKSxcbiAgYmluZExpc3RlbmVyczogZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGJpbmRMaXN0ZW5lcnMob2JqKSB7XG4gICAgICB2YXIgX3RoaXM0ID0gdGhpcztcblxuICAgICAgZm4uZWFjaE9iamVjdChmdW5jdGlvbiAobWV0aG9kTmFtZSwgc3ltYm9sKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IF90aGlzNFttZXRob2ROYW1lXTtcblxuICAgICAgICBpZiAoIWxpc3RlbmVyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFN0cmluZyhtZXRob2ROYW1lKSArICcgZGVmaW5lZCBidXQgZG9lcyBub3QgZXhpc3QgaW4gJyArIFN0cmluZyhfdGhpczQuZGlzcGxheU5hbWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHN5bWJvbCkpIHtcbiAgICAgICAgICBzeW1ib2wuZm9yRWFjaChmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgICAgICBfdGhpczQuYmluZEFjdGlvbihhY3Rpb24sIGxpc3RlbmVyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfdGhpczQuYmluZEFjdGlvbihzeW1ib2wsIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSwgW29ial0pO1xuICAgIH1cblxuICAgIHJldHVybiBiaW5kTGlzdGVuZXJzO1xuICB9KClcbn07XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFN0b3JlTWl4aW47XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmNyZWF0ZVN0b3JlQ29uZmlnID0gY3JlYXRlU3RvcmVDb25maWc7XG5leHBvcnRzLnRyYW5zZm9ybVN0b3JlID0gdHJhbnNmb3JtU3RvcmU7XG5leHBvcnRzLmNyZWF0ZVN0b3JlRnJvbU9iamVjdCA9IGNyZWF0ZVN0b3JlRnJvbU9iamVjdDtcbmV4cG9ydHMuY3JlYXRlU3RvcmVGcm9tQ2xhc3MgPSBjcmVhdGVTdG9yZUZyb21DbGFzcztcblxudmFyIF9BbHRVdGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzL0FsdFV0aWxzJyk7XG5cbnZhciB1dGlscyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9BbHRVdGlscyk7XG5cbnZhciBfZnVuY3Rpb25zID0gcmVxdWlyZSgnLi4vZnVuY3Rpb25zJyk7XG5cbnZhciBmbiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9mdW5jdGlvbnMpO1xuXG52YXIgX0FsdFN0b3JlID0gcmVxdWlyZSgnLi9BbHRTdG9yZScpO1xuXG52YXIgX0FsdFN0b3JlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0FsdFN0b3JlKTtcblxudmFyIF9TdG9yZU1peGluID0gcmVxdWlyZSgnLi9TdG9yZU1peGluJyk7XG5cbnZhciBfU3RvcmVNaXhpbjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9TdG9yZU1peGluKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHsgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkgeyByZXR1cm4gb2JqOyB9IGVsc2UgeyB2YXIgbmV3T2JqID0ge307IGlmIChvYmogIT0gbnVsbCkgeyBmb3IgKHZhciBrZXkgaW4gb2JqKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldOyB9IH0gbmV3T2JqWydkZWZhdWx0J10gPSBvYmo7IHJldHVybiBuZXdPYmo7IH0gfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7IGlmICghc2VsZikgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbmZ1bmN0aW9uIGRvU2V0U3RhdGUoc3RvcmUsIHN0b3JlSW5zdGFuY2UsIHN0YXRlKSB7XG4gIGlmICghc3RhdGUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgY29uZmlnID0gc3RvcmVJbnN0YW5jZS5TdG9yZU1vZGVsLmNvbmZpZztcblxuXG4gIHZhciBuZXh0U3RhdGUgPSBmbi5pc0Z1bmN0aW9uKHN0YXRlKSA/IHN0YXRlKHN0b3JlSW5zdGFuY2Uuc3RhdGUpIDogc3RhdGU7XG5cbiAgc3RvcmVJbnN0YW5jZS5zdGF0ZSA9IGNvbmZpZy5zZXRTdGF0ZS5jYWxsKHN0b3JlLCBzdG9yZUluc3RhbmNlLnN0YXRlLCBuZXh0U3RhdGUpO1xuXG4gIGlmICghc3RvcmUuYWx0LmRpc3BhdGNoZXIuaXNEaXNwYXRjaGluZygpKSB7XG4gICAgc3RvcmUuZW1pdENoYW5nZSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVByb3RvdHlwZShwcm90bywgYWx0LCBrZXksIGV4dHJhcykge1xuICByZXR1cm4gZm4uYXNzaWduKHByb3RvLCBfU3RvcmVNaXhpbjIuZGVmYXVsdCwge1xuICAgIGRpc3BsYXlOYW1lOiBrZXksXG4gICAgYWx0OiBhbHQsXG4gICAgZGlzcGF0Y2hlcjogYWx0LmRpc3BhdGNoZXIsXG4gICAgcHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0KCkge1xuICAgICAgICB0aGlzLmdldEluc3RhbmNlKCkucHJldmVudERlZmF1bHQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldmVudERlZmF1bHQ7XG4gICAgfSgpLFxuXG4gICAgYm91bmRMaXN0ZW5lcnM6IFtdLFxuICAgIGxpZmVjeWNsZUV2ZW50czoge30sXG4gICAgYWN0aW9uTGlzdGVuZXJzOiB7fSxcbiAgICBwdWJsaWNNZXRob2RzOiB7fSxcbiAgICBoYW5kbGVzT3duRXJyb3JzOiBmYWxzZVxuICB9LCBleHRyYXMpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTdG9yZUNvbmZpZyhnbG9iYWxDb25maWcsIFN0b3JlTW9kZWwpIHtcbiAgU3RvcmVNb2RlbC5jb25maWcgPSBmbi5hc3NpZ24oe1xuICAgIGdldFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBmdW5jdGlvbiBnZXRTdGF0ZShzdGF0ZSkge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShzdGF0ZSkpIHtcbiAgICAgICAgICByZXR1cm4gc3RhdGUuc2xpY2UoKTtcbiAgICAgICAgfSBlbHNlIGlmIChmbi5pc011dGFibGVPYmplY3Qoc3RhdGUpKSB7XG4gICAgICAgICAgcmV0dXJuIGZuLmFzc2lnbih7fSwgc3RhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZ2V0U3RhdGU7XG4gICAgfSgpLFxuICAgIHNldFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBmdW5jdGlvbiBzZXRTdGF0ZShjdXJyZW50U3RhdGUsIG5leHRTdGF0ZSkge1xuICAgICAgICBpZiAoZm4uaXNNdXRhYmxlT2JqZWN0KG5leHRTdGF0ZSkpIHtcbiAgICAgICAgICByZXR1cm4gZm4uYXNzaWduKGN1cnJlbnRTdGF0ZSwgbmV4dFN0YXRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV4dFN0YXRlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2V0U3RhdGU7XG4gICAgfSgpXG4gIH0sIGdsb2JhbENvbmZpZywgU3RvcmVNb2RlbC5jb25maWcpO1xufVxuXG5mdW5jdGlvbiB0cmFuc2Zvcm1TdG9yZSh0cmFuc2Zvcm1zLCBTdG9yZU1vZGVsKSB7XG4gIHJldHVybiB0cmFuc2Zvcm1zLnJlZHVjZShmdW5jdGlvbiAoU3RvcmUsIHRyYW5zZm9ybSkge1xuICAgIHJldHVybiB0cmFuc2Zvcm0oU3RvcmUpO1xuICB9LCBTdG9yZU1vZGVsKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3RvcmVGcm9tT2JqZWN0KGFsdCwgU3RvcmVNb2RlbCwga2V5KSB7XG4gIHZhciBzdG9yZUluc3RhbmNlID0gdm9pZCAwO1xuXG4gIHZhciBTdG9yZVByb3RvID0gY3JlYXRlUHJvdG90eXBlKHt9LCBhbHQsIGtleSwgZm4uYXNzaWduKHtcbiAgICBnZXRJbnN0YW5jZTogZnVuY3Rpb24gKCkge1xuICAgICAgZnVuY3Rpb24gZ2V0SW5zdGFuY2UoKSB7XG4gICAgICAgIHJldHVybiBzdG9yZUluc3RhbmNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZ2V0SW5zdGFuY2U7XG4gICAgfSgpLFxuICAgIHNldFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBmdW5jdGlvbiBzZXRTdGF0ZShuZXh0U3RhdGUpIHtcbiAgICAgICAgZG9TZXRTdGF0ZSh0aGlzLCBzdG9yZUluc3RhbmNlLCBuZXh0U3RhdGUpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2V0U3RhdGU7XG4gICAgfSgpXG4gIH0sIFN0b3JlTW9kZWwpKTtcblxuICAvLyBiaW5kIHRoZSBzdG9yZSBsaXN0ZW5lcnNcbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKFN0b3JlUHJvdG8uYmluZExpc3RlbmVycykge1xuICAgIF9TdG9yZU1peGluMi5kZWZhdWx0LmJpbmRMaXN0ZW5lcnMuY2FsbChTdG9yZVByb3RvLCBTdG9yZVByb3RvLmJpbmRMaXN0ZW5lcnMpO1xuICB9XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gIGlmIChTdG9yZVByb3RvLm9ic2VydmUpIHtcbiAgICBfU3RvcmVNaXhpbjIuZGVmYXVsdC5iaW5kTGlzdGVuZXJzLmNhbGwoU3RvcmVQcm90bywgU3RvcmVQcm90by5vYnNlcnZlKGFsdCkpO1xuICB9XG5cbiAgLy8gYmluZCB0aGUgbGlmZWN5Y2xlIGV2ZW50c1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoU3RvcmVQcm90by5saWZlY3ljbGUpIHtcbiAgICBmbi5lYWNoT2JqZWN0KGZ1bmN0aW9uIChldmVudE5hbWUsIGV2ZW50KSB7XG4gICAgICBfU3RvcmVNaXhpbjIuZGVmYXVsdC5vbi5jYWxsKFN0b3JlUHJvdG8sIGV2ZW50TmFtZSwgZXZlbnQpO1xuICAgIH0sIFtTdG9yZVByb3RvLmxpZmVjeWNsZV0pO1xuICB9XG5cbiAgLy8gY3JlYXRlIHRoZSBpbnN0YW5jZSBhbmQgZm4uYXNzaWduIHRoZSBwdWJsaWMgbWV0aG9kcyB0byB0aGUgaW5zdGFuY2VcbiAgc3RvcmVJbnN0YW5jZSA9IGZuLmFzc2lnbihuZXcgX0FsdFN0b3JlMi5kZWZhdWx0KGFsdCwgU3RvcmVQcm90bywgU3RvcmVQcm90by5zdGF0ZSAhPT0gdW5kZWZpbmVkID8gU3RvcmVQcm90by5zdGF0ZSA6IHt9LCBTdG9yZU1vZGVsKSwgU3RvcmVQcm90by5wdWJsaWNNZXRob2RzLCB7XG4gICAgZGlzcGxheU5hbWU6IGtleSxcbiAgICBjb25maWc6IFN0b3JlTW9kZWwuY29uZmlnXG4gIH0pO1xuXG4gIHJldHVybiBzdG9yZUluc3RhbmNlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTdG9yZUZyb21DbGFzcyhhbHQsIFN0b3JlTW9kZWwsIGtleSkge1xuICB2YXIgc3RvcmVJbnN0YW5jZSA9IHZvaWQgMDtcbiAgdmFyIGNvbmZpZyA9IFN0b3JlTW9kZWwuY29uZmlnO1xuXG4gIC8vIENyZWF0aW5nIGEgY2xhc3MgaGVyZSBzbyB3ZSBkb24ndCBvdmVybG9hZCB0aGUgcHJvdmlkZWQgc3RvcmUnc1xuICAvLyBwcm90b3R5cGUgd2l0aCB0aGUgbWl4aW4gYmVoYXZpb3VyIGFuZCBJJ20gZXh0ZW5kaW5nIGZyb20gU3RvcmVNb2RlbFxuICAvLyBzbyB3ZSBjYW4gaW5oZXJpdCBhbnkgZXh0ZW5zaW9ucyBmcm9tIHRoZSBwcm92aWRlZCBzdG9yZS5cblxuICB2YXIgU3RvcmUgPSBmdW5jdGlvbiAoX1N0b3JlTW9kZWwpIHtcbiAgICBfaW5oZXJpdHMoU3RvcmUsIF9TdG9yZU1vZGVsKTtcblxuICAgIGZ1bmN0aW9uIFN0b3JlKCkge1xuICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFN0b3JlKTtcblxuICAgICAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjIpLCBfa2V5MiA9IDA7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgICAgYXJnc1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgX1N0b3JlTW9kZWwuY2FsbC5hcHBseShfU3RvcmVNb2RlbCwgW3RoaXNdLmNvbmNhdChhcmdzKSkpO1xuICAgIH1cblxuICAgIHJldHVybiBTdG9yZTtcbiAgfShTdG9yZU1vZGVsKTtcblxuICBjcmVhdGVQcm90b3R5cGUoU3RvcmUucHJvdG90eXBlLCBhbHQsIGtleSwge1xuICAgIHR5cGU6ICdBbHRTdG9yZScsXG4gICAgZ2V0SW5zdGFuY2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGZ1bmN0aW9uIGdldEluc3RhbmNlKCkge1xuICAgICAgICByZXR1cm4gc3RvcmVJbnN0YW5jZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGdldEluc3RhbmNlO1xuICAgIH0oKSxcbiAgICBzZXRTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgZnVuY3Rpb24gc2V0U3RhdGUobmV4dFN0YXRlKSB7XG4gICAgICAgIGRvU2V0U3RhdGUodGhpcywgc3RvcmVJbnN0YW5jZSwgbmV4dFN0YXRlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNldFN0YXRlO1xuICAgIH0oKVxuICB9KTtcblxuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJnc0ZvckNsYXNzID0gQXJyYXkoX2xlbiA+IDMgPyBfbGVuIC0gMyA6IDApLCBfa2V5ID0gMzsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NGb3JDbGFzc1tfa2V5IC0gM10gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICB2YXIgc3RvcmUgPSBuZXcgKEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmFwcGx5KFN0b3JlLCBbbnVsbF0uY29uY2F0KGFyZ3NGb3JDbGFzcykpKSgpO1xuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGlmIChjb25maWcuYmluZExpc3RlbmVycykgc3RvcmUuYmluZExpc3RlbmVycyhjb25maWcuYmluZExpc3RlbmVycyk7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGlmIChjb25maWcuZGF0YXNvdXJjZSkgc3RvcmUucmVnaXN0ZXJBc3luYyhjb25maWcuZGF0YXNvdXJjZSk7XG5cbiAgc3RvcmVJbnN0YW5jZSA9IGZuLmFzc2lnbihuZXcgX0FsdFN0b3JlMi5kZWZhdWx0KGFsdCwgc3RvcmUsIHN0b3JlLnN0YXRlICE9PSB1bmRlZmluZWQgPyBzdG9yZS5zdGF0ZSA6IHN0b3JlLCBTdG9yZU1vZGVsKSwgdXRpbHMuZ2V0SW50ZXJuYWxNZXRob2RzKFN0b3JlTW9kZWwpLCBjb25maWcucHVibGljTWV0aG9kcywgeyBkaXNwbGF5TmFtZToga2V5IH0pO1xuXG4gIHJldHVybiBzdG9yZUluc3RhbmNlO1xufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZ2V0SW50ZXJuYWxNZXRob2RzID0gZ2V0SW50ZXJuYWxNZXRob2RzO1xuZXhwb3J0cy5nZXRQcm90b3R5cGVDaGFpbiA9IGdldFByb3RvdHlwZUNoYWluO1xuZXhwb3J0cy53YXJuID0gd2FybjtcbmV4cG9ydHMudWlkID0gdWlkO1xuZXhwb3J0cy5mb3JtYXRBc0NvbnN0YW50ID0gZm9ybWF0QXNDb25zdGFudDtcbmV4cG9ydHMuZGlzcGF0Y2hJZGVudGl0eSA9IGRpc3BhdGNoSWRlbnRpdHk7XG5leHBvcnRzLmZzYSA9IGZzYTtcbmV4cG9ydHMuZGlzcGF0Y2ggPSBkaXNwYXRjaDtcblxudmFyIF9mdW5jdGlvbnMgPSByZXF1aXJlKCcuLi9mdW5jdGlvbnMnKTtcblxudmFyIGZuID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX2Z1bmN0aW9ucyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKG9iaikgeyBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7IHJldHVybiBvYmo7IH0gZWxzZSB7IHZhciBuZXdPYmogPSB7fTsgaWYgKG9iaiAhPSBudWxsKSB7IGZvciAodmFyIGtleSBpbiBvYmopIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIG5ld09ialtrZXldID0gb2JqW2tleV07IH0gfSBuZXdPYmpbJ2RlZmF1bHQnXSA9IG9iajsgcmV0dXJuIG5ld09iajsgfSB9XG5cbi8qZXNsaW50LWRpc2FibGUqL1xudmFyIGJ1aWx0SW5zID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTm9vcENsYXNzKTtcbnZhciBidWlsdEluUHJvdG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhOb29wQ2xhc3MucHJvdG90eXBlKTtcbi8qZXNsaW50LWVuYWJsZSovXG5cbmZ1bmN0aW9uIGdldEludGVybmFsTWV0aG9kcyhPYmosIGlzUHJvdG8pIHtcbiAgdmFyIGV4Y2x1ZGVkID0gaXNQcm90byA/IGJ1aWx0SW5Qcm90byA6IGJ1aWx0SW5zO1xuICB2YXIgb2JqID0gaXNQcm90byA/IE9iai5wcm90b3R5cGUgOiBPYmo7XG4gIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLnJlZHVjZShmdW5jdGlvbiAodmFsdWUsIG0pIHtcbiAgICBpZiAoZXhjbHVkZWQuaW5kZXhPZihtKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICB2YWx1ZVttXSA9IG9ialttXTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH0sIHt9KTtcbn1cblxuZnVuY3Rpb24gZ2V0UHJvdG90eXBlQ2hhaW4oT2JqKSB7XG4gIHZhciBtZXRob2RzID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMV07XG5cbiAgcmV0dXJuIE9iaiA9PT0gRnVuY3Rpb24ucHJvdG90eXBlID8gbWV0aG9kcyA6IGdldFByb3RvdHlwZUNoYWluKE9iamVjdC5nZXRQcm90b3R5cGVPZihPYmopLCBmbi5hc3NpZ24obWV0aG9kcywgZ2V0SW50ZXJuYWxNZXRob2RzKE9iaiwgdHJ1ZSkpKTtcbn1cblxuZnVuY3Rpb24gd2Fybihtc2cpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgLyplc2xpbnQtZGlzYWJsZSovXG4gIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBjb25zb2xlLndhcm4obmV3IFJlZmVyZW5jZUVycm9yKG1zZykpO1xuICB9XG4gIC8qZXNsaW50LWVuYWJsZSovXG59XG5cbmZ1bmN0aW9uIHVpZChjb250YWluZXIsIG5hbWUpIHtcbiAgdmFyIGNvdW50ID0gMDtcbiAgdmFyIGtleSA9IG5hbWU7XG4gIHdoaWxlIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChjb250YWluZXIsIGtleSkpIHtcbiAgICBrZXkgPSBuYW1lICsgU3RyaW5nKCsrY291bnQpO1xuICB9XG4gIHJldHVybiBrZXk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEFzQ29uc3RhbnQobmFtZSkge1xuICByZXR1cm4gbmFtZS5yZXBsYWNlKC9bYS16XShbQS1aXSkvZywgZnVuY3Rpb24gKGkpIHtcbiAgICByZXR1cm4gU3RyaW5nKGlbMF0pICsgJ18nICsgU3RyaW5nKGlbMV0udG9Mb3dlckNhc2UoKSk7XG4gIH0pLnRvVXBwZXJDYXNlKCk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoSWRlbnRpdHkoeCkge1xuICBpZiAoeCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gbnVsbDtcblxuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYSA9IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBhW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHJldHVybiBhLmxlbmd0aCA/IFt4XS5jb25jYXQoYSkgOiB4O1xufVxuXG5mdW5jdGlvbiBmc2EoaWQsIHR5cGUsIHBheWxvYWQsIGRldGFpbHMpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiB0eXBlLFxuICAgIHBheWxvYWQ6IHBheWxvYWQsXG4gICAgbWV0YTogX2V4dGVuZHMoe1xuICAgICAgZGlzcGF0Y2hJZDogaWRcbiAgICB9LCBkZXRhaWxzKSxcblxuICAgIGlkOiBpZCxcbiAgICBhY3Rpb246IHR5cGUsXG4gICAgZGF0YTogcGF5bG9hZCxcbiAgICBkZXRhaWxzOiBkZXRhaWxzXG4gIH07XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoKGlkLCBhY3Rpb25PYmosIHBheWxvYWQsIGFsdCkge1xuICB2YXIgZGF0YSA9IGFjdGlvbk9iai5kaXNwYXRjaChwYXlsb2FkKTtcbiAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCkgcmV0dXJuIG51bGw7XG5cbiAgdmFyIHR5cGUgPSBhY3Rpb25PYmouaWQ7XG4gIHZhciBuYW1lc3BhY2UgPSB0eXBlO1xuICB2YXIgbmFtZSA9IHR5cGU7XG4gIHZhciBkZXRhaWxzID0geyBpZDogdHlwZSwgbmFtZXNwYWNlOiBuYW1lc3BhY2UsIG5hbWU6IG5hbWUgfTtcblxuICB2YXIgZGlzcGF0Y2hMYXRlciA9IGZ1bmN0aW9uIGRpc3BhdGNoTGF0ZXIoeCkge1xuICAgIHJldHVybiBhbHQuZGlzcGF0Y2godHlwZSwgeCwgZGV0YWlscyk7XG4gIH07XG5cbiAgaWYgKGZuLmlzRnVuY3Rpb24oZGF0YSkpIHJldHVybiBkYXRhKGRpc3BhdGNoTGF0ZXIsIGFsdCk7XG5cbiAgLy8gWFhYIHN0YW5kYXJkaXplIHRoaXNcbiAgcmV0dXJuIGFsdC5kaXNwYXRjaGVyLmRpc3BhdGNoKGZzYShpZCwgdHlwZSwgZGF0YSwgZGV0YWlscykpO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZnVuY3Rpb24gTm9vcENsYXNzKCkge30iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnNldEFwcFN0YXRlID0gc2V0QXBwU3RhdGU7XG5leHBvcnRzLnNuYXBzaG90ID0gc25hcHNob3Q7XG5leHBvcnRzLnNhdmVJbml0aWFsU25hcHNob3QgPSBzYXZlSW5pdGlhbFNuYXBzaG90O1xuZXhwb3J0cy5maWx0ZXJTbmFwc2hvdHMgPSBmaWx0ZXJTbmFwc2hvdHM7XG5cbnZhciBfZnVuY3Rpb25zID0gcmVxdWlyZSgnLi4vZnVuY3Rpb25zJyk7XG5cbnZhciBmbiA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKF9mdW5jdGlvbnMpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmopIHsgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkgeyByZXR1cm4gb2JqOyB9IGVsc2UgeyB2YXIgbmV3T2JqID0ge307IGlmIChvYmogIT0gbnVsbCkgeyBmb3IgKHZhciBrZXkgaW4gb2JqKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldOyB9IH0gbmV3T2JqWydkZWZhdWx0J10gPSBvYmo7IHJldHVybiBuZXdPYmo7IH0gfVxuXG5mdW5jdGlvbiBzZXRBcHBTdGF0ZShpbnN0YW5jZSwgZGF0YSwgb25TdG9yZSkge1xuICB2YXIgb2JqID0gaW5zdGFuY2UuZGVzZXJpYWxpemUoZGF0YSk7XG4gIGZuLmVhY2hPYmplY3QoZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICB2YXIgc3RvcmUgPSBpbnN0YW5jZS5zdG9yZXNba2V5XTtcbiAgICBpZiAoc3RvcmUpIHtcbiAgICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjb25maWcgPSBzdG9yZS5TdG9yZU1vZGVsLmNvbmZpZztcblxuICAgICAgICB2YXIgc3RhdGUgPSBzdG9yZS5zdGF0ZTtcbiAgICAgICAgaWYgKGNvbmZpZy5vbkRlc2VyaWFsaXplKSBvYmpba2V5XSA9IGNvbmZpZy5vbkRlc2VyaWFsaXplKHZhbHVlKSB8fCB2YWx1ZTtcbiAgICAgICAgaWYgKGZuLmlzTXV0YWJsZU9iamVjdChzdGF0ZSkpIHtcbiAgICAgICAgICBmbi5lYWNoT2JqZWN0KGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVsZXRlIHN0YXRlW2tdO1xuICAgICAgICAgIH0sIFtzdGF0ZV0pO1xuICAgICAgICAgIGZuLmFzc2lnbihzdGF0ZSwgb2JqW2tleV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0b3JlLnN0YXRlID0gb2JqW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgb25TdG9yZShzdG9yZSwgc3RvcmUuc3RhdGUpO1xuICAgICAgfSkoKTtcbiAgICB9XG4gIH0sIFtvYmpdKTtcbn1cblxuZnVuY3Rpb24gc25hcHNob3QoaW5zdGFuY2UpIHtcbiAgdmFyIHN0b3JlTmFtZXMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBbXSA6IGFyZ3VtZW50c1sxXTtcblxuICB2YXIgc3RvcmVzID0gc3RvcmVOYW1lcy5sZW5ndGggPyBzdG9yZU5hbWVzIDogT2JqZWN0LmtleXMoaW5zdGFuY2Uuc3RvcmVzKTtcbiAgcmV0dXJuIHN0b3Jlcy5yZWR1Y2UoZnVuY3Rpb24gKG9iaiwgc3RvcmVIYW5kbGUpIHtcbiAgICB2YXIgc3RvcmVOYW1lID0gc3RvcmVIYW5kbGUuZGlzcGxheU5hbWUgfHwgc3RvcmVIYW5kbGU7XG4gICAgdmFyIHN0b3JlID0gaW5zdGFuY2Uuc3RvcmVzW3N0b3JlTmFtZV07XG4gICAgdmFyIGNvbmZpZyA9IHN0b3JlLlN0b3JlTW9kZWwuY29uZmlnO1xuXG4gICAgc3RvcmUubGlmZWN5Y2xlKCdzbmFwc2hvdCcpO1xuICAgIHZhciBjdXN0b21TbmFwc2hvdCA9IGNvbmZpZy5vblNlcmlhbGl6ZSAmJiBjb25maWcub25TZXJpYWxpemUoc3RvcmUuc3RhdGUpO1xuICAgIG9ialtzdG9yZU5hbWVdID0gY3VzdG9tU25hcHNob3QgPyBjdXN0b21TbmFwc2hvdCA6IHN0b3JlLmdldFN0YXRlKCk7XG4gICAgcmV0dXJuIG9iajtcbiAgfSwge30pO1xufVxuXG5mdW5jdGlvbiBzYXZlSW5pdGlhbFNuYXBzaG90KGluc3RhbmNlLCBrZXkpIHtcbiAgdmFyIHN0YXRlID0gaW5zdGFuY2UuZGVzZXJpYWxpemUoaW5zdGFuY2Uuc2VyaWFsaXplKGluc3RhbmNlLnN0b3Jlc1trZXldLnN0YXRlKSk7XG4gIGluc3RhbmNlLl9pbml0U25hcHNob3Rba2V5XSA9IHN0YXRlO1xuICBpbnN0YW5jZS5fbGFzdFNuYXBzaG90W2tleV0gPSBzdGF0ZTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyU25hcHNob3RzKGluc3RhbmNlLCBzdGF0ZSwgc3RvcmVzKSB7XG4gIHJldHVybiBzdG9yZXMucmVkdWNlKGZ1bmN0aW9uIChvYmosIHN0b3JlKSB7XG4gICAgdmFyIHN0b3JlTmFtZSA9IHN0b3JlLmRpc3BsYXlOYW1lIHx8IHN0b3JlO1xuICAgIGlmICghc3RhdGVbc3RvcmVOYW1lXSkge1xuICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFN0cmluZyhzdG9yZU5hbWUpICsgJyBpcyBub3QgYSB2YWxpZCBzdG9yZScpO1xuICAgIH1cbiAgICBvYmpbc3RvcmVOYW1lXSA9IHN0YXRlW3N0b3JlTmFtZV07XG4gICAgcmV0dXJuIG9iajtcbiAgfSwge30pO1xufSIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTMtMjAxNSwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBpbnZhcmlhbnRcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBVc2UgaW52YXJpYW50KCkgdG8gYXNzZXJ0IHN0YXRlIHdoaWNoIHlvdXIgcHJvZ3JhbSBhc3N1bWVzIHRvIGJlIHRydWUuXG4gKlxuICogUHJvdmlkZSBzcHJpbnRmLXN0eWxlIGZvcm1hdCAob25seSAlcyBpcyBzdXBwb3J0ZWQpIGFuZCBhcmd1bWVudHNcbiAqIHRvIHByb3ZpZGUgaW5mb3JtYXRpb24gYWJvdXQgd2hhdCBicm9rZSBhbmQgd2hhdCB5b3Ugd2VyZVxuICogZXhwZWN0aW5nLlxuICpcbiAqIFRoZSBpbnZhcmlhbnQgbWVzc2FnZSB3aWxsIGJlIHN0cmlwcGVkIGluIHByb2R1Y3Rpb24sIGJ1dCB0aGUgaW52YXJpYW50XG4gKiB3aWxsIHJlbWFpbiB0byBlbnN1cmUgbG9naWMgZG9lcyBub3QgZGlmZmVyIGluIHByb2R1Y3Rpb24uXG4gKi9cblxudmFyIGludmFyaWFudCA9IGZ1bmN0aW9uIChjb25kaXRpb24sIGZvcm1hdCwgYSwgYiwgYywgZCwgZSwgZikge1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIGlmIChmb3JtYXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhcmlhbnQgcmVxdWlyZXMgYW4gZXJyb3IgbWVzc2FnZSBhcmd1bWVudCcpO1xuICAgIH1cbiAgfVxuXG4gIGlmICghY29uZGl0aW9uKSB7XG4gICAgdmFyIGVycm9yO1xuICAgIGlmIChmb3JtYXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoJ01pbmlmaWVkIGV4Y2VwdGlvbiBvY2N1cnJlZDsgdXNlIHRoZSBub24tbWluaWZpZWQgZGV2IGVudmlyb25tZW50ICcgKyAnZm9yIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2UgYW5kIGFkZGl0aW9uYWwgaGVscGZ1bCB3YXJuaW5ncy4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGFyZ3MgPSBbYSwgYiwgYywgZCwgZSwgZl07XG4gICAgICB2YXIgYXJnSW5kZXggPSAwO1xuICAgICAgZXJyb3IgPSBuZXcgRXJyb3IoJ0ludmFyaWFudCBWaW9sYXRpb246ICcgKyBmb3JtYXQucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gYXJnc1thcmdJbmRleCsrXTtcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICBlcnJvci5mcmFtZXNUb1BvcCA9IDE7IC8vIHdlIGRvbid0IGNhcmUgYWJvdXQgaW52YXJpYW50J3Mgb3duIGZyYW1lXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW52YXJpYW50OyIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cy5EaXNwYXRjaGVyID0gcmVxdWlyZSgnLi9saWIvRGlzcGF0Y2hlcicpO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNSwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBEaXNwYXRjaGVyXG4gKiBcbiAqIEBwcmV2ZW50TXVuZ2VcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgaW52YXJpYW50ID0gcmVxdWlyZSgnZmJqcy9saWIvaW52YXJpYW50Jyk7XG5cbnZhciBfcHJlZml4ID0gJ0lEXyc7XG5cbi8qKlxuICogRGlzcGF0Y2hlciBpcyB1c2VkIHRvIGJyb2FkY2FzdCBwYXlsb2FkcyB0byByZWdpc3RlcmVkIGNhbGxiYWNrcy4gVGhpcyBpc1xuICogZGlmZmVyZW50IGZyb20gZ2VuZXJpYyBwdWItc3ViIHN5c3RlbXMgaW4gdHdvIHdheXM6XG4gKlxuICogICAxKSBDYWxsYmFja3MgYXJlIG5vdCBzdWJzY3JpYmVkIHRvIHBhcnRpY3VsYXIgZXZlbnRzLiBFdmVyeSBwYXlsb2FkIGlzXG4gKiAgICAgIGRpc3BhdGNoZWQgdG8gZXZlcnkgcmVnaXN0ZXJlZCBjYWxsYmFjay5cbiAqICAgMikgQ2FsbGJhY2tzIGNhbiBiZSBkZWZlcnJlZCBpbiB3aG9sZSBvciBwYXJ0IHVudGlsIG90aGVyIGNhbGxiYWNrcyBoYXZlXG4gKiAgICAgIGJlZW4gZXhlY3V0ZWQuXG4gKlxuICogRm9yIGV4YW1wbGUsIGNvbnNpZGVyIHRoaXMgaHlwb3RoZXRpY2FsIGZsaWdodCBkZXN0aW5hdGlvbiBmb3JtLCB3aGljaFxuICogc2VsZWN0cyBhIGRlZmF1bHQgY2l0eSB3aGVuIGEgY291bnRyeSBpcyBzZWxlY3RlZDpcbiAqXG4gKiAgIHZhciBmbGlnaHREaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAqXG4gKiAgIC8vIEtlZXBzIHRyYWNrIG9mIHdoaWNoIGNvdW50cnkgaXMgc2VsZWN0ZWRcbiAqICAgdmFyIENvdW50cnlTdG9yZSA9IHtjb3VudHJ5OiBudWxsfTtcbiAqXG4gKiAgIC8vIEtlZXBzIHRyYWNrIG9mIHdoaWNoIGNpdHkgaXMgc2VsZWN0ZWRcbiAqICAgdmFyIENpdHlTdG9yZSA9IHtjaXR5OiBudWxsfTtcbiAqXG4gKiAgIC8vIEtlZXBzIHRyYWNrIG9mIHRoZSBiYXNlIGZsaWdodCBwcmljZSBvZiB0aGUgc2VsZWN0ZWQgY2l0eVxuICogICB2YXIgRmxpZ2h0UHJpY2VTdG9yZSA9IHtwcmljZTogbnVsbH1cbiAqXG4gKiBXaGVuIGEgdXNlciBjaGFuZ2VzIHRoZSBzZWxlY3RlZCBjaXR5LCB3ZSBkaXNwYXRjaCB0aGUgcGF5bG9hZDpcbiAqXG4gKiAgIGZsaWdodERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICogICAgIGFjdGlvblR5cGU6ICdjaXR5LXVwZGF0ZScsXG4gKiAgICAgc2VsZWN0ZWRDaXR5OiAncGFyaXMnXG4gKiAgIH0pO1xuICpcbiAqIFRoaXMgcGF5bG9hZCBpcyBkaWdlc3RlZCBieSBgQ2l0eVN0b3JlYDpcbiAqXG4gKiAgIGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgIGlmIChwYXlsb2FkLmFjdGlvblR5cGUgPT09ICdjaXR5LXVwZGF0ZScpIHtcbiAqICAgICAgIENpdHlTdG9yZS5jaXR5ID0gcGF5bG9hZC5zZWxlY3RlZENpdHk7XG4gKiAgICAgfVxuICogICB9KTtcbiAqXG4gKiBXaGVuIHRoZSB1c2VyIHNlbGVjdHMgYSBjb3VudHJ5LCB3ZSBkaXNwYXRjaCB0aGUgcGF5bG9hZDpcbiAqXG4gKiAgIGZsaWdodERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICogICAgIGFjdGlvblR5cGU6ICdjb3VudHJ5LXVwZGF0ZScsXG4gKiAgICAgc2VsZWN0ZWRDb3VudHJ5OiAnYXVzdHJhbGlhJ1xuICogICB9KTtcbiAqXG4gKiBUaGlzIHBheWxvYWQgaXMgZGlnZXN0ZWQgYnkgYm90aCBzdG9yZXM6XG4gKlxuICogICBDb3VudHJ5U3RvcmUuZGlzcGF0Y2hUb2tlbiA9IGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgIGlmIChwYXlsb2FkLmFjdGlvblR5cGUgPT09ICdjb3VudHJ5LXVwZGF0ZScpIHtcbiAqICAgICAgIENvdW50cnlTdG9yZS5jb3VudHJ5ID0gcGF5bG9hZC5zZWxlY3RlZENvdW50cnk7XG4gKiAgICAgfVxuICogICB9KTtcbiAqXG4gKiBXaGVuIHRoZSBjYWxsYmFjayB0byB1cGRhdGUgYENvdW50cnlTdG9yZWAgaXMgcmVnaXN0ZXJlZCwgd2Ugc2F2ZSBhIHJlZmVyZW5jZVxuICogdG8gdGhlIHJldHVybmVkIHRva2VuLiBVc2luZyB0aGlzIHRva2VuIHdpdGggYHdhaXRGb3IoKWAsIHdlIGNhbiBndWFyYW50ZWVcbiAqIHRoYXQgYENvdW50cnlTdG9yZWAgaXMgdXBkYXRlZCBiZWZvcmUgdGhlIGNhbGxiYWNrIHRoYXQgdXBkYXRlcyBgQ2l0eVN0b3JlYFxuICogbmVlZHMgdG8gcXVlcnkgaXRzIGRhdGEuXG4gKlxuICogICBDaXR5U3RvcmUuZGlzcGF0Y2hUb2tlbiA9IGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgIGlmIChwYXlsb2FkLmFjdGlvblR5cGUgPT09ICdjb3VudHJ5LXVwZGF0ZScpIHtcbiAqICAgICAgIC8vIGBDb3VudHJ5U3RvcmUuY291bnRyeWAgbWF5IG5vdCBiZSB1cGRhdGVkLlxuICogICAgICAgZmxpZ2h0RGlzcGF0Y2hlci53YWl0Rm9yKFtDb3VudHJ5U3RvcmUuZGlzcGF0Y2hUb2tlbl0pO1xuICogICAgICAgLy8gYENvdW50cnlTdG9yZS5jb3VudHJ5YCBpcyBub3cgZ3VhcmFudGVlZCB0byBiZSB1cGRhdGVkLlxuICpcbiAqICAgICAgIC8vIFNlbGVjdCB0aGUgZGVmYXVsdCBjaXR5IGZvciB0aGUgbmV3IGNvdW50cnlcbiAqICAgICAgIENpdHlTdG9yZS5jaXR5ID0gZ2V0RGVmYXVsdENpdHlGb3JDb3VudHJ5KENvdW50cnlTdG9yZS5jb3VudHJ5KTtcbiAqICAgICB9XG4gKiAgIH0pO1xuICpcbiAqIFRoZSB1c2FnZSBvZiBgd2FpdEZvcigpYCBjYW4gYmUgY2hhaW5lZCwgZm9yIGV4YW1wbGU6XG4gKlxuICogICBGbGlnaHRQcmljZVN0b3JlLmRpc3BhdGNoVG9rZW4gPVxuICogICAgIGZsaWdodERpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24ocGF5bG9hZCkge1xuICogICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvblR5cGUpIHtcbiAqICAgICAgICAgY2FzZSAnY291bnRyeS11cGRhdGUnOlxuICogICAgICAgICBjYXNlICdjaXR5LXVwZGF0ZSc6XG4gKiAgICAgICAgICAgZmxpZ2h0RGlzcGF0Y2hlci53YWl0Rm9yKFtDaXR5U3RvcmUuZGlzcGF0Y2hUb2tlbl0pO1xuICogICAgICAgICAgIEZsaWdodFByaWNlU3RvcmUucHJpY2UgPVxuICogICAgICAgICAgICAgZ2V0RmxpZ2h0UHJpY2VTdG9yZShDb3VudHJ5U3RvcmUuY291bnRyeSwgQ2l0eVN0b3JlLmNpdHkpO1xuICogICAgICAgICAgIGJyZWFrO1xuICogICAgIH1cbiAqICAgfSk7XG4gKlxuICogVGhlIGBjb3VudHJ5LXVwZGF0ZWAgcGF5bG9hZCB3aWxsIGJlIGd1YXJhbnRlZWQgdG8gaW52b2tlIHRoZSBzdG9yZXMnXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcyBpbiBvcmRlcjogYENvdW50cnlTdG9yZWAsIGBDaXR5U3RvcmVgLCB0aGVuXG4gKiBgRmxpZ2h0UHJpY2VTdG9yZWAuXG4gKi9cblxudmFyIERpc3BhdGNoZXIgPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBEaXNwYXRjaGVyKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEaXNwYXRjaGVyKTtcblxuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHRoaXMuX2lzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9pc0hhbmRsZWQgPSB7fTtcbiAgICB0aGlzLl9pc1BlbmRpbmcgPSB7fTtcbiAgICB0aGlzLl9sYXN0SUQgPSAxO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgd2l0aCBldmVyeSBkaXNwYXRjaGVkIHBheWxvYWQuIFJldHVybnNcbiAgICogYSB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHdpdGggYHdhaXRGb3IoKWAuXG4gICAqL1xuXG4gIERpc3BhdGNoZXIucHJvdG90eXBlLnJlZ2lzdGVyID0gZnVuY3Rpb24gcmVnaXN0ZXIoY2FsbGJhY2spIHtcbiAgICB2YXIgaWQgPSBfcHJlZml4ICsgdGhpcy5fbGFzdElEKys7XG4gICAgdGhpcy5fY2FsbGJhY2tzW2lkXSA9IGNhbGxiYWNrO1xuICAgIHJldHVybiBpZDtcbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGNhbGxiYWNrIGJhc2VkIG9uIGl0cyB0b2tlbi5cbiAgICovXG5cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUudW5yZWdpc3RlciA9IGZ1bmN0aW9uIHVucmVnaXN0ZXIoaWQpIHtcbiAgICAhdGhpcy5fY2FsbGJhY2tzW2lkXSA/IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgPyBpbnZhcmlhbnQoZmFsc2UsICdEaXNwYXRjaGVyLnVucmVnaXN0ZXIoLi4uKTogYCVzYCBkb2VzIG5vdCBtYXAgdG8gYSByZWdpc3RlcmVkIGNhbGxiYWNrLicsIGlkKSA6IGludmFyaWFudChmYWxzZSkgOiB1bmRlZmluZWQ7XG4gICAgZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1tpZF07XG4gIH07XG5cbiAgLyoqXG4gICAqIFdhaXRzIGZvciB0aGUgY2FsbGJhY2tzIHNwZWNpZmllZCB0byBiZSBpbnZva2VkIGJlZm9yZSBjb250aW51aW5nIGV4ZWN1dGlvblxuICAgKiBvZiB0aGUgY3VycmVudCBjYWxsYmFjay4gVGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgdXNlZCBieSBhIGNhbGxiYWNrIGluXG4gICAqIHJlc3BvbnNlIHRvIGEgZGlzcGF0Y2hlZCBwYXlsb2FkLlxuICAgKi9cblxuICBEaXNwYXRjaGVyLnByb3RvdHlwZS53YWl0Rm9yID0gZnVuY3Rpb24gd2FpdEZvcihpZHMpIHtcbiAgICAhdGhpcy5faXNEaXNwYXRjaGluZyA/IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgPyBpbnZhcmlhbnQoZmFsc2UsICdEaXNwYXRjaGVyLndhaXRGb3IoLi4uKTogTXVzdCBiZSBpbnZva2VkIHdoaWxlIGRpc3BhdGNoaW5nLicpIDogaW52YXJpYW50KGZhbHNlKSA6IHVuZGVmaW5lZDtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgaWRzLmxlbmd0aDsgaWkrKykge1xuICAgICAgdmFyIGlkID0gaWRzW2lpXTtcbiAgICAgIGlmICh0aGlzLl9pc1BlbmRpbmdbaWRdKSB7XG4gICAgICAgICF0aGlzLl9pc0hhbmRsZWRbaWRdID8gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyA/IGludmFyaWFudChmYWxzZSwgJ0Rpc3BhdGNoZXIud2FpdEZvciguLi4pOiBDaXJjdWxhciBkZXBlbmRlbmN5IGRldGVjdGVkIHdoaWxlICcgKyAnd2FpdGluZyBmb3IgYCVzYC4nLCBpZCkgOiBpbnZhcmlhbnQoZmFsc2UpIDogdW5kZWZpbmVkO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgICF0aGlzLl9jYWxsYmFja3NbaWRdID8gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyA/IGludmFyaWFudChmYWxzZSwgJ0Rpc3BhdGNoZXIud2FpdEZvciguLi4pOiBgJXNgIGRvZXMgbm90IG1hcCB0byBhIHJlZ2lzdGVyZWQgY2FsbGJhY2suJywgaWQpIDogaW52YXJpYW50KGZhbHNlKSA6IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX2ludm9rZUNhbGxiYWNrKGlkKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgYSBwYXlsb2FkIHRvIGFsbCByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAgICovXG5cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuZGlzcGF0Y2ggPSBmdW5jdGlvbiBkaXNwYXRjaChwYXlsb2FkKSB7XG4gICAgISF0aGlzLl9pc0Rpc3BhdGNoaW5nID8gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyA/IGludmFyaWFudChmYWxzZSwgJ0Rpc3BhdGNoLmRpc3BhdGNoKC4uLik6IENhbm5vdCBkaXNwYXRjaCBpbiB0aGUgbWlkZGxlIG9mIGEgZGlzcGF0Y2guJykgOiBpbnZhcmlhbnQoZmFsc2UpIDogdW5kZWZpbmVkO1xuICAgIHRoaXMuX3N0YXJ0RGlzcGF0Y2hpbmcocGF5bG9hZCk7XG4gICAgdHJ5IHtcbiAgICAgIGZvciAodmFyIGlkIGluIHRoaXMuX2NhbGxiYWNrcykge1xuICAgICAgICBpZiAodGhpcy5faXNQZW5kaW5nW2lkXSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2ludm9rZUNhbGxiYWNrKGlkKTtcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5fc3RvcERpc3BhdGNoaW5nKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBJcyB0aGlzIERpc3BhdGNoZXIgY3VycmVudGx5IGRpc3BhdGNoaW5nLlxuICAgKi9cblxuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5pc0Rpc3BhdGNoaW5nID0gZnVuY3Rpb24gaXNEaXNwYXRjaGluZygpIHtcbiAgICByZXR1cm4gdGhpcy5faXNEaXNwYXRjaGluZztcbiAgfTtcblxuICAvKipcbiAgICogQ2FsbCB0aGUgY2FsbGJhY2sgc3RvcmVkIHdpdGggdGhlIGdpdmVuIGlkLiBBbHNvIGRvIHNvbWUgaW50ZXJuYWxcbiAgICogYm9va2tlZXBpbmcuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cblxuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5faW52b2tlQ2FsbGJhY2sgPSBmdW5jdGlvbiBfaW52b2tlQ2FsbGJhY2soaWQpIHtcbiAgICB0aGlzLl9pc1BlbmRpbmdbaWRdID0gdHJ1ZTtcbiAgICB0aGlzLl9jYWxsYmFja3NbaWRdKHRoaXMuX3BlbmRpbmdQYXlsb2FkKTtcbiAgICB0aGlzLl9pc0hhbmRsZWRbaWRdID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogU2V0IHVwIGJvb2trZWVwaW5nIG5lZWRlZCB3aGVuIGRpc3BhdGNoaW5nLlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG5cbiAgRGlzcGF0Y2hlci5wcm90b3R5cGUuX3N0YXJ0RGlzcGF0Y2hpbmcgPSBmdW5jdGlvbiBfc3RhcnREaXNwYXRjaGluZyhwYXlsb2FkKSB7XG4gICAgZm9yICh2YXIgaWQgaW4gdGhpcy5fY2FsbGJhY2tzKSB7XG4gICAgICB0aGlzLl9pc1BlbmRpbmdbaWRdID0gZmFsc2U7XG4gICAgICB0aGlzLl9pc0hhbmRsZWRbaWRdID0gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuX3BlbmRpbmdQYXlsb2FkID0gcGF5bG9hZDtcbiAgICB0aGlzLl9pc0Rpc3BhdGNoaW5nID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQ2xlYXIgYm9va2tlZXBpbmcgdXNlZCBmb3IgZGlzcGF0Y2hpbmcuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cblxuICBEaXNwYXRjaGVyLnByb3RvdHlwZS5fc3RvcERpc3BhdGNoaW5nID0gZnVuY3Rpb24gX3N0b3BEaXNwYXRjaGluZygpIHtcbiAgICBkZWxldGUgdGhpcy5fcGVuZGluZ1BheWxvYWQ7XG4gICAgdGhpcy5faXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICB9O1xuXG4gIHJldHVybiBEaXNwYXRjaGVyO1xufSkoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBEaXNwYXRjaGVyOyIsIm1vZHVsZS5leHBvcnRzID0gaXNQcm9taXNlO1xuXG5mdW5jdGlvbiBpc1Byb21pc2Uob2JqKSB7XG4gIHJldHVybiAhIW9iaiAmJiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykgJiYgdHlwZW9mIG9iai50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuKGZ1bmN0aW9uICgpIHtcbiAgdHJ5IHtcbiAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNhY2hlZFNldFRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaXMgbm90IGRlZmluZWQnKTtcbiAgICB9XG4gIH1cbiAgdHJ5IHtcbiAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBpcyBub3QgZGVmaW5lZCcpO1xuICAgIH1cbiAgfVxufSAoKSlcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IGNhY2hlZFNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNhY2hlZENsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHRyYW5zbWl0dGVyKCkge1xuICB2YXIgc3Vic2NyaXB0aW9ucyA9IFtdO1xuICB2YXIgcHVzaGluZyA9IGZhbHNlO1xuICB2YXIgdG9VbnN1YnNjcmliZSA9IFtdO1xuXG4gIHZhciB1bnN1YnNjcmliZSA9IGZ1bmN0aW9uIHVuc3Vic2NyaWJlKG9uQ2hhbmdlKSB7XG4gICAgaWYgKHB1c2hpbmcpIHtcbiAgICAgIHRvVW5zdWJzY3JpYmUucHVzaChvbkNoYW5nZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBpZCA9IHN1YnNjcmlwdGlvbnMuaW5kZXhPZihvbkNoYW5nZSk7XG4gICAgaWYgKGlkID49IDApIHN1YnNjcmlwdGlvbnMuc3BsaWNlKGlkLCAxKTtcbiAgfTtcblxuICB2YXIgc3Vic2NyaWJlID0gZnVuY3Rpb24gc3Vic2NyaWJlKG9uQ2hhbmdlKSB7XG4gICAgc3Vic2NyaXB0aW9ucy5wdXNoKG9uQ2hhbmdlKTtcbiAgICB2YXIgZGlzcG9zZSA9IGZ1bmN0aW9uIGRpc3Bvc2UoKSB7XG4gICAgICByZXR1cm4gdW5zdWJzY3JpYmUob25DaGFuZ2UpO1xuICAgIH07XG4gICAgcmV0dXJuIHsgZGlzcG9zZTogZGlzcG9zZSB9O1xuICB9O1xuXG4gIHZhciBwdXNoID0gZnVuY3Rpb24gcHVzaCh2YWx1ZSkge1xuICAgIGlmIChwdXNoaW5nKSB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBwdXNoIHdoaWxlIHB1c2hpbmcnKTtcbiAgICBwdXNoaW5nID0gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgc3Vic2NyaXB0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbih2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgcHVzaGluZyA9IGZhbHNlO1xuICAgICAgdG9VbnN1YnNjcmliZSA9IHRvVW5zdWJzY3JpYmUuZmlsdGVyKHVuc3Vic2NyaWJlKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHsgc3Vic2NyaWJlOiBzdWJzY3JpYmUsIHB1c2g6IHB1c2gsIHVuc3Vic2NyaWJlOiB1bnN1YnNjcmliZSwgc3Vic2NyaXB0aW9uczogc3Vic2NyaXB0aW9ucyB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRyYW5zbWl0dGVyO1xuXG4iLCJpbXBvcnQgUmVhY3QsIHtDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBFeGFtcGxlIGZyb20gJy4vRXhhbXBsZSc7XG5cbi8qIGZsdXggKi9cbmltcG9ydCBmbHV4IGZyb20gJy4vZmx1eCc7XG5pbXBvcnQgY29ubmVjdFRvU3RvcmVzIGZyb20gJ2FsdC11dGlscy9saWIvY29ubmVjdFRvU3RvcmVzJztcblxuY2xhc3MgQXBwIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgXG4gIHN0YXRpYyBjb21wb25lbnREaWRDb25uZWN0KCkge1xuICAgIGZsdXguYWN0aW9ucy5hcHAubW9uaXRvcldpbmRvd1NpemUodHJ1ZSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0U3RvcmVzKHByb3BzKSB7XG4gICAgY29uc29sZS5sb2coJ2dldCBzdG9yZXMnKVxuICAgIHJldHVybiBbZmx1eC5zdG9yZXMuYXBwXTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRQcm9wc0Zyb21TdG9yZXMocHJvcHMpIHtcbiAgICBsZXQgYXBwU3RhdGUgPSBmbHV4LnN0b3Jlcy5hcHAuZ2V0U3RhdGUoKTtcblxuICAgIHJldHVybiB7XG4gICAgICBtb25pdG9yV2luZG93U2l6ZTogYXBwU3RhdGUubW9uaXRvcldpbmRvd1NpemUsXG4gICAgICB3aW5kb3dTaXplOiBhcHBTdGF0ZS53aW5kb3dTaXplXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGZsdXguYWN0aW9ucy5hcHApKTtcbiAgICBjb25zb2xlLmxvZygnYXBwIG1vdW50ZWQnKVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICBpZiAobmV4dFByb3BzLm1vbml0b3JXaW5kb3dTaXplICE9PSB0aGlzLnByb3BzLm1vbml0b3JXaW5kb3dTaXplKSB7XG4gICAgICB0aGlzLnNldFdpbmRvd1NpemVMaXN0ZW5lcnMobmV4dFByb3BzLm1vbml0b3JXaW5kb3dTaXplKTtcbiAgICB9XG4gIH1cblxuICBzZXRXaW5kb3dTaXplTGlzdGVuZXJzKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyhgc2V0V2luZG93U2l6ZUxpc3RlbmVycyAke2VuYWJsZWR9YClcbiAgICBpZiAoIWVuYWJsZWQpIHtcbiAgICAgIHJldHVybiAkKHdpbmRvdykub2ZmKFwicmVzaXplXCIpO1xuICAgIH1cblxuICAgIHRoaXMuY2hlY2tXaW5kb3dTaXplKCk7XG4gICAgJCh3aW5kb3cpLnJlc2l6ZSh0aGlzLmNoZWNrV2luZG93U2l6ZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGNoZWNrV2luZG93U2l6ZSgpIHtcbiAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEoXCJzY3JlZW4gYW5kIChtYXgtd2lkdGggOiA1NDRweClcIikubWF0Y2hlcyl7XG4gICAgICB0aGlzLnVwZGF0ZVdpbmRvd1NpemUoJ3hzJyk7XG4gICAgfSBlbHNlIGlmICh3aW5kb3cubWF0Y2hNZWRpYShcInNjcmVlbiBhbmQgKG1heC13aWR0aCA6IDc2OHB4KVwiKS5tYXRjaGVzKSB7XG4gICAgICB0aGlzLnVwZGF0ZVdpbmRvd1NpemUoJ3NtJyk7XG4gICAgfSBlbHNlIGlmICh3aW5kb3cubWF0Y2hNZWRpYShcInNjcmVlbiBhbmQgKG1heC13aWR0aCA6IDk5MnB4KVwiKS5tYXRjaGVzKSB7XG4gICAgICB0aGlzLnVwZGF0ZVdpbmRvd1NpemUoJ21kJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXBkYXRlV2luZG93U2l6ZSgnbGcnKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVXaW5kb3dTaXplKHNpemUpIHtcbiAgICBpZiAoc2l6ZSAhPT0gdGhpcy5wcm9wcy53aW5kb3dTaXplKSB7XG4gICAgICBjb25zb2xlLmxvZyhgdXBkYXRlV2luZG93U2l6ZSAke3NpemV9YClcbiAgICAgIGZsdXguYWN0aW9ucy5hcHAuc2V0V2luZG93U2l6ZShzaXplKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBmbHV4LmFjdGlvbnMuYXBwLm1vbml0b3JXaW5kb3dTaXplKGZhbHNlKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEV4YW1wbGUgLz5cbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNvbm5lY3RUb1N0b3JlcyhBcHApXG4iLCJpbXBvcnQgUmVhY3QsIHtDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZXNwb25zaXZlQ29tcG9uZW50IGZyb20gJy4vUmVzcG9uc2l2ZUNvbXBvbmVudCc7XG5cbi8qIGZsdXggKi9cbmltcG9ydCBmbHV4IGZyb20gJy4vZmx1eCc7XG5pbXBvcnQgY29ubmVjdFRvU3RvcmVzIGZyb20gJ2FsdC11dGlscy9saWIvY29ubmVjdFRvU3RvcmVzJztcblxuY2xhc3MgRXhhbXBsZSBleHRlbmRzIFJlc3BvbnNpdmVDb21wb25lbnQge1xuXG4gIHN0YXRpYyBnZXRTdG9yZXMoKSB7XG4gICAgcmV0dXJuIFtmbHV4LnN0b3Jlcy5hcHBdO1xuICB9XG5cbiAgc3RhdGljIGdldFByb3BzRnJvbVN0b3JlcygpIHtcbiAgICBsZXQgYXBwU3RhdGUgPSBmbHV4LnN0b3Jlcy5hcHAuZ2V0U3RhdGUoKTtcblxuICAgIHJldHVybiB7XG4gICAgICB3aW5kb3dTaXplOiBhcHBTdGF0ZS53aW5kb3dTaXplXG4gICAgfTtcbiAgfVxuXG4gIHJlbmRlck1vYmlsZSgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5Nb2JpbGU8L2Rpdj5cbiAgICApXG4gIH1cblxuICByZW5kZXJEZXNrdG9wKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PkRlc2t0b3A8L2Rpdj5cbiAgICApXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY29ubmVjdFRvU3RvcmVzKEV4YW1wbGUpXG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCwge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuXG5jb25zdCBtZXRob2RNYXAgPSB7XG4gIHhzOiAnRXh0cmFTbWFsbCcsXG4gIHNtOiAnU21hbGwnLFxuICBtZDogJ01lZGl1bScsXG4gIGxnOiAnTGFyZ2UnLFxuICBkZXNrdG9wOiAnRGVza3RvcCcsXG4gIG1vYmlsZTogJ01vYmlsZSdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc3BvbnNpdmVDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgbWFya3VwO1xuICAgIGlmIChbJ3hzJywgJ3NtJ10uaW5kZXhPZih0aGlzLnByb3BzLndpbmRvd1NpemUpICE9IC0xKSB7XG4gICAgICBpZiAodGhpcy5yZW5kZXJNb2JpbGUpIHtcbiAgICAgICAgbWFya3VwID0gdGhpcy5yZW5kZXJNb2JpbGUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcmt1cCA9IHRoaXMucmVuZGVyU2l6ZSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5yZW5kZXJEZXNrdG9wKSB7XG4gICAgICAgIG1hcmt1cCA9IHRoaXMucmVuZGVyRGVza3RvcCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFya3VwID0gdGhpcy5yZW5kZXJTaXplKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcmt1cDtcbiAgfVxuXG4gIHJlbmRlclNpemUoKSB7XG4gICAgbGV0IF90aGlzID0gdGhpcztcbiAgICBsZXQgcmVuZGVyT3JkZXIgPSBbJ2Rlc2t0b3AnLCAnbGcnLCAnbWQnLCAnc20nLCAneHMnLCAnbW9iaWxlJ107XG4gICAgbGV0IHN0YXJ0aW5nUG9pbnQgPSByZW5kZXJPcmRlci5pbmRleE9mKHRoaXMucHJvcHMud2luZG93U2l6ZSk7XG4gICAgbGV0IGF2YWlsYWJsZVNpemVzID0gcmVuZGVyT3JkZXIuc2xpY2Uoc3RhcnRpbmdQb2ludCwgcmVuZGVyT3JkZXIubGVuZ3RoKTtcbiAgICAvKiBzZWFyY2ggZG93biB0aGUgbGluZSBmb3IgdGhlIGZpcnN0IGF2YWlsYWJsZSByZW5kZXIgbWV0aG9kKi9cbiAgICBsZXQgc2l6ZSA9IF8uZmluZChhdmFpbGFibGVTaXplcywgKHNpemUpID0+IHtcbiAgICAgIHJldHVybiBfdGhpc1sncmVuZGVyJyttZXRob2RNYXBbc2l6ZV1dO1xuICAgIH0pO1xuXG4gICAgbGV0IG1hcmt1cDtcbiAgICBpZiAoIXNpemUpIHtcbiAgICAgIC8qIHRyeSBzZWFyY2hpbmcgdXAgdGhlIGxpbmUgKi9cbiAgICAgIGF2YWlsYWJsZVNpemVzID0gXy5yZXZlcnNlKHJlbmRlck9yZGVyLnNsaWNlKDAsIHN0YXJ0aW5nUG9pbnQpKTtcbiAgICAgIHNpemUgPSBfLmZpbmQoYXZhaWxhYmxlU2l6ZXMsIChzaXplKSA9PiB7XG4gICAgICAgIHJldHVybiBfdGhpc1sncmVuZGVyJyttZXRob2RNYXBbc2l6ZV1dO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICghc2l6ZSkge1xuICAgICAgICBtYXJrdXAgPSAoPGRpdj5UaGlzIGNvbXBvbmVudCBkb2VzIG5vdCBpbXBsZW1lbnQgcmVzcG9uc2l2ZSByZW5kZXIgbWV0aG9kczwvZGl2Pik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcmt1cCA9IHRoaXNbJ3JlbmRlcicrbWV0aG9kTWFwW3NpemVdXSgpO1xuICAgIH1cblxuICAgIHJldHVybiBtYXJrdXA7XG4gIH1cblxufVxuIiwiaW1wb3J0IGFsdCBmcm9tICcuLi9hbHQnO1xuXG5jbGFzcyBBcHBBY3Rpb25zIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB2YXIgc2ltcGxlQWN0aW9ucyA9IFtcbiAgICAgICdtb25pdG9yV2luZG93U2l6ZScsXG4gICAgICAnc2V0V2luZG93U2l6ZSdcbiAgICBdO1xuXG4gICAgdGhpcy5nZW5lcmF0ZUFjdGlvbnMuYXBwbHkodGhpcywgc2ltcGxlQWN0aW9ucyk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYWx0LmNyZWF0ZUFjdGlvbnMoQXBwQWN0aW9ucyk7XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIGFwcDogcmVxdWlyZSgnLi9hcHAnKSxcbn1cbiIsImltcG9ydCBBbHQgZnJvbSAnYWx0JztcbmV4cG9ydCBkZWZhdWx0IG5ldyBBbHQoKTtcbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgYWN0aW9uczogcmVxdWlyZSgnLi9hY3Rpb25zJyksXG4gIHN0b3JlczogcmVxdWlyZSgnLi9zdG9yZXMnKVxufVxuIiwiaW1wb3J0IGFsdCBmcm9tICcuLi9hbHQnO1xuXG5jb25zdCBBY3Rpb25zID0gYWx0LmFjdGlvbnMuQXBwQWN0aW9ucztcblxuY2xhc3MgQXBwU3RvcmUge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc2V0RGVmYXVsdHMoKTtcblxuICAgIHRoaXMuYmluZExpc3RlbmVycyh7XG4gICAgICBzZXRNb25pdG9yV2luZG93U2l6ZTogQWN0aW9ucy5tb25pdG9yV2luZG93U2l6ZSxcbiAgICAgIHNldFdpbmRvd1NpemU6IEFjdGlvbnMuc2V0V2luZG93U2l6ZSxcbiAgICB9KTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuc2V0RGVmYXVsdHMoKTtcbiAgfVxuXG4gIHNldERlZmF1bHRzKCkge1xuICAgIHRoaXMubW9uaXRvcldpbmRvd1NpemUgPSBmYWxzZTtcbiAgICB0aGlzLndpbmRvd1NpemUgPSAnbGcnO1xuICB9XG4gIFxuICBzZXRDdXJyZW50V2luZG93U2l6ZSh2YWx1ZSkge1xuICAgIHRoaXMuY3VycmVudFdpbmRvd1NpemUgPSB2YWx1ZTtcbiAgfVxuXG4gIHNldE1vbml0b3JXaW5kb3dTaXplKHZhbHVlKSB7XG4gICAgdGhpcy5tb25pdG9yV2luZG93U2l6ZSA9IHZhbHVlO1xuICB9XG5cbiAgc2V0V2luZG93U2l6ZSh2YWx1ZSkge1xuICAgIHRoaXMud2luZG93U2l6ZSA9IHZhbHVlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFsdC5jcmVhdGVTdG9yZShBcHBTdG9yZSk7XG4iLCJleHBvcnQgZGVmYXVsdCB7XG4gIGFwcDogcmVxdWlyZSgnLi9hcHAnKVxufVxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7cmVuZGVyfSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IEFwcCBmcm9tICcuL0FwcCc7XG5cbnJlbmRlcihcbiAgPEFwcCAvPixcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKVxuKTtcbiJdfQ==
