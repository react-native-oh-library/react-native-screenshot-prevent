import { NativeModules, NativeEventEmitter, Platform, DeviceEventEmitter } from 'react-native';
import { useEffect } from 'react';
import RNScreenshotPreventBackon from './NativeScreenShotPrevent';
let addListen, RNScreenshotPrevent;
let flag = true;
if (Platform.OS !== "web") {
  if (Platform.OS == "harmony") {
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
        DeviceEventEmitter.removeAllListeners();
        DeviceEventEmitter.addListener('screenshot_did_happen', data => {
          fn();
        });
        RNScreenshotPreventBackon === null || RNScreenshotPreventBackon === void 0 || RNScreenshotPreventBackon.addListener_bn();
        flag = false;
      }
      return {
        remove: () => {
          RNScreenshotPreventBackon === null || RNScreenshotPreventBackon === void 0 || RNScreenshotPreventBackon.removeListener_bn();
          DeviceEventEmitter.removeAllListeners();
          flag = true;
        }
      };
    };
    RNScreenshotPrevent = {
      disableSecureView: RNScreenshotPreventBackon.disableSecureView_bn,
      enabled: function enabled(enabled) {
        RNScreenshotPreventBackon === null || RNScreenshotPreventBackon === void 0 || RNScreenshotPreventBackon.enabled_bn(enabled);
      },
      addListener: addListen
    };
  } else {
    const {
      RNScreenshotPrevent: RNScreenshotPreventNative
    } = NativeModules;
    RNScreenshotPrevent = {
      ...RNScreenshotPreventNative,
      enableSecureView: function enableSecureView(imagePath = "") {
        RNScreenshotPreventNative.enableSecureView(imagePath);
      }
    };
    const eventEmitter = new NativeEventEmitter(RNScreenshotPrevent);

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
export const usePreventScreenshot = () => {
  useEffect(() => {
    RNScreenshotPrevent.enabled(true);
    return () => {
      RNScreenshotPrevent.enabled(false);
    };
  }, []);
};
export const useDisableSecureView = (imagePath = "") => {
  useEffect(() => {
    RNScreenshotPrevent.enableSecureView(imagePath);
    return () => {
      RNScreenshotPrevent.disableSecureView();
    };
  }, []);
};
export const enabled = RNScreenshotPrevent.enabled;
export const enableSecureView = RNScreenshotPrevent.enableSecureView;
export const disableSecureView = RNScreenshotPrevent.disableSecureView;
export const addListener = addListen;
export default RNScreenshotPrevent;
//# sourceMappingURL=index.js.map