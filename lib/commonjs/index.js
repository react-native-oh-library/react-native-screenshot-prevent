"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePreventScreenshot = exports.useDisableSecureView = exports.enabled = exports.enableSecureView = exports.disableSecureView = exports.default = exports.addListener = void 0;
var _reactNative = require("react-native");
var _react = require("react");
var _NativeScreenShotPrevent = _interopRequireDefault(require("./NativeScreenShotPrevent"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
let addListen, RNScreenshotPrevent;
let flag = true;
if (_reactNative.Platform.OS !== "web") {
  if (_reactNative.Platform.OS == "harmony") {
    addListen = fn => {
      if (typeof fn !== 'function') {
        throw new Error('RNScreenshotPrevent: addListener requires valid callback function');
        return {
          remove: () => {
            throw new Error("RNScreenshotPrevent: remove not work because addListener requires valid callback function");
          }
        };
      }
      if (flag) {
        _reactNative.DeviceEventEmitter.removeAllListeners();
        _reactNative.DeviceEventEmitter.addListener('screenshot_did_happen', data => {
          fn();
        });
        _NativeScreenShotPrevent.default === null || _NativeScreenShotPrevent.default === void 0 || _NativeScreenShotPrevent.default.addListener_bn();
        flag = false;
      }
      return {
        remove: () => {
          _NativeScreenShotPrevent.default === null || _NativeScreenShotPrevent.default === void 0 || _NativeScreenShotPrevent.default.removeListener_bn();
          _reactNative.DeviceEventEmitter.removeAllListeners();
          flag = true;
        }
      };
    };
    RNScreenshotPrevent = {
      disableSecureView: _NativeScreenShotPrevent.default.disableSecureView_bn,
      enabled: function enabled(enabled) {
        _NativeScreenShotPrevent.default === null || _NativeScreenShotPrevent.default === void 0 || _NativeScreenShotPrevent.default.enabled_bn(enabled);
      },
      addListener: addListen
    };
  } else {
    const {
      RNScreenshotPrevent: RNScreenshotPreventNative
    } = _reactNative.NativeModules;
    RNScreenshotPrevent = {
      ...RNScreenshotPreventNative,
      enableSecureView: function enableSecureView(imagePath = "") {
        RNScreenshotPreventNative.enableSecureView(imagePath);
      }
    };
    const eventEmitter = new _reactNative.NativeEventEmitter(RNScreenshotPrevent);

    /**
     * subscribes to userDidTakeScreenshot event
     * @param {function} callback handler
     * @returns {function} unsubscribe fn
     */
    addListen = fn => {
      if (typeof fn !== 'function') {
        console.error('RNScreenshotPrevent: addListener requires valid callback function');
        return {
          remove: () => {
            console.error("RNScreenshotPrevent: remove not work because addListener requires valid callback function");
          }
        };
      }
      return eventEmitter.addListener("userDidTakeScreenshot", fn);
    };
  }
} else {
  RNScreenshotPrevent = {
    enabled: enabled => {
      console.warn("RNScreenshotPrevent: enabled not work in web. value: " + enabled);
    },
    enableSecureView: (imagePath = "") => {
      console.warn("RNScreenshotPrevent: enableSecureView not work in web." + (!!imagePath ? " send: " + imagePath : ""));
    },
    disableSecureView: () => {
      console.warn("RNScreenshotPrevent: disableSecureView not work in web");
    }
  };
  addListen = fn => {
    if (typeof fn !== 'function') {
      console.error('RNScreenshotPrevent: addListener requires valid callback function');
      return {
        remove: () => {
          console.error("RNScreenshotPrevent: remove not work because addListener requires valid callback function");
        }
      };
    }
    console.warn("RNScreenshotPrevent: addListener not work in web");
    return {
      remove: () => {
        console.warn("RNScreenshotPrevent: remove addListener not work in web");
      }
    };
  };
}
const usePreventScreenshot = () => {
  (0, _react.useEffect)(() => {
    RNScreenshotPrevent.enabled(true);
    return () => {
      RNScreenshotPrevent.enabled(false);
    };
  }, []);
};
exports.usePreventScreenshot = usePreventScreenshot;
const useDisableSecureView = (imagePath = "") => {
  (0, _react.useEffect)(() => {
    RNScreenshotPrevent.enableSecureView(imagePath);
    return () => {
      RNScreenshotPrevent.disableSecureView();
    };
  }, []);
};
exports.useDisableSecureView = useDisableSecureView;
const enabled = exports.enabled = RNScreenshotPrevent.enabled;
const enableSecureView = exports.enableSecureView = RNScreenshotPrevent.enableSecureView;
const disableSecureView = exports.disableSecureView = RNScreenshotPrevent.disableSecureView;
const addListener = exports.addListener = addListen;
var _default = exports.default = RNScreenshotPrevent;
//# sourceMappingURL=index.js.map