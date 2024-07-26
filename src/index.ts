import { NativeModules, NativeEventEmitter, Platform,DeviceEventEmitter} from 'react-native';
import { useEffect } from 'react';
import RNScreenshotPreventBackon from './NativeScreenShotPrevent';

type FN = (resp: any) => void
type Return = {
    readonly remove: () => void
}
let addListen: any, RNScreenshotPrevent: any;
let flag:boolean=true;
if (Platform.OS !== "web") {
    if(Platform.OS == "harmony"){
        addListen = (fn: FN): Return => {
            if (typeof (fn) !== 'function') {
                throw new Error('RNScreenshotPrevent: addListener requires valid callback function');
                return {
                    remove: (): void => {
                        throw new Error("RNScreenshotPrevent: remove not work because addListener requires valid callback function");
                    }
                };
            }
            if(flag){
                DeviceEventEmitter.removeAllListeners();
                DeviceEventEmitter.addListener('screenshot_did_happen',(data)=>{
                    fn();
                })
                RNScreenshotPreventBackon?.addListener_bn();
                flag=false;
            }
            return {
                remove: (): void => {
                    RNScreenshotPreventBackon?.removeListener_bn();
                    DeviceEventEmitter.removeAllListeners();
                    flag=true;
                }
            }
        }
        RNScreenshotPrevent = {
            disableSecureView:RNScreenshotPreventBackon.disableSecureView_bn,
            enabled:function enabled(enabled: boolean){
                RNScreenshotPreventBackon?.enabled_bn(enabled)
            },
            addListener:addListen
        }
    }else{
        const { RNScreenshotPrevent: RNScreenshotPreventNative } = NativeModules;
        RNScreenshotPrevent = {
            ...RNScreenshotPreventNative,
            enableSecureView: function enableSecureView(imagePath: string = "") {
                RNScreenshotPreventNative.enableSecureView(imagePath)
            }
        }
        const eventEmitter = new NativeEventEmitter(RNScreenshotPrevent);
    
        /**
         * subscribes to userDidTakeScreenshot event
         * @param {function} callback handler
         * @returns {function} unsubscribe fn
         */
        addListen = (fn: FN): Return => {
            if (typeof (fn) !== 'function') {
                console.error('RNScreenshotPrevent: addListener requires valid callback function');
                return {
                    remove: (): void => {
                        console.error("RNScreenshotPrevent: remove not work because addListener requires valid callback function");
                    }
                };
            }
    
            return eventEmitter.addListener("userDidTakeScreenshot", fn);
        }
    }
    
} else {
    RNScreenshotPrevent = {
        enabled: (enabled: boolean): void => {
            console.warn("RNScreenshotPrevent: enabled not work in web. value: " + enabled);
        },
        enableSecureView: (imagePath: string = ""): void => {
            console.warn("RNScreenshotPrevent: enableSecureView not work in web."+(!!imagePath ? " send: "+imagePath : ""));
        },
        disableSecureView: (): void => {
            console.warn("RNScreenshotPrevent: disableSecureView not work in web");
        }
    }
    addListen = (fn: FN): Return => {
        if (typeof (fn) !== 'function') {
            console.error('RNScreenshotPrevent: addListener requires valid callback function');
            return {
                remove: (): void => {
                    console.error("RNScreenshotPrevent: remove not work because addListener requires valid callback function");
                }
            };
        }
        console.warn("RNScreenshotPrevent: addListener not work in web");
        return {
            remove: (): void => {
                console.warn("RNScreenshotPrevent: remove addListener not work in web");
            }
        }
    }
}

export const usePreventScreenshot = () => {
    useEffect(() => {
        RNScreenshotPrevent.enabled(true);
        return () => {
            RNScreenshotPrevent.enabled(false);
        };
    }, []);
}

export const useDisableSecureView = (imagePath: string = "") => {
    useEffect(() => {
        RNScreenshotPrevent.enableSecureView(imagePath);
        return () => {
            RNScreenshotPrevent.disableSecureView();
        };
    }, []);
}


export const enabled: (enabled: boolean) => void = RNScreenshotPrevent.enabled
export const enableSecureView: (imagePath?: string) => void = RNScreenshotPrevent.enableSecureView
export const disableSecureView: () => string = RNScreenshotPrevent.disableSecureView
export const addListener: (fn: FN) => Object = addListen

export default RNScreenshotPrevent;
