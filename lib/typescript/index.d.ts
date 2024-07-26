type FN = (resp: any) => void;
declare let RNScreenshotPrevent: any;
export declare const usePreventScreenshot: () => void;
export declare const useDisableSecureView: (imagePath?: string) => void;
export declare const enabled: (enabled: boolean) => void;
export declare const enableSecureView: (imagePath?: string) => void;
export declare const disableSecureView: () => void;
export declare const addListener: (fn: FN) => void;
export default RNScreenshotPrevent;
