import type { TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { TM } from "@rnoh/react-native-openharmony/generated/ts"
import { TurboModule} from '@rnoh/react-native-openharmony/ts'
import window from '@ohos.window';
// 权限获取
import abilityAccessCtrl, { Context, PermissionRequestResult } from '@ohos.abilityAccessCtrl';
import { BusinessError } from '@ohos.base';

import Logger from './Logger'
const TAG='测试windowClass'
const TAG2='测试事件监听'
export class RNScreenShotPreventTurboModule extends TurboModule implements TM.NativeScreenShotPreventNativeModule.Spec {
  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
    this.initialize(this.ctx.uiAbilityContext)
  }
  private windowClass:undefined|window.Window;
  async initialize(ctx){
    const windowInstance = await window.getLastWindow(ctx);
    const windowInfo = windowInstance.getWindowProperties()
    this.windowClass=windowInstance;
    Logger.info(TAG, `获取到window实例：${JSON.stringify(windowInfo)}`)
  }
  enabled_bn(enabled: boolean):void{
    // 获取权限
    let atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();
    let context: Context = this.ctx.uiAbilityContext;
    atManager.requestPermissionsFromUser(context, ['ohos.permission.PRIVACY_WINDOW'], (err: BusinessError, data: PermissionRequestResult)=>{
      if (err) {
        Logger.info(`requestPermissionsFromUser fail, err->${JSON.stringify(err)}`);
      } else {
        Logger.info(TAG,`获取ohos.permission.PRIVACY_WINDOW权限信息`);
        Logger.info(TAG,'data:' + JSON.stringify(data));
        Logger.info(TAG,'data permissions:' + data.permissions);
        Logger.info(TAG,'data authResults:' + data.authResults);
        if(data.authResults.includes(0)){
          Logger.info(TAG,'ohos.permission.PRIVACY_WINDOW权限申请成功');
          try {
            let promise = this.windowClass.setWindowPrivacyMode(enabled);
            promise.then(()=> {
              Logger.info(TAG,'Succeeded in setting the window to privacy mode.');
            }).catch((err)=>{
              Logger.info(TAG,'Failed to set the window to privacy mode. Cause: ' + JSON.stringify(err));
            });
          } catch (exception) {
            Logger.info(TAG,'Failed to set the window to privacy mode. Cause:' + JSON.stringify(exception));
          }
        }else{
          Logger.info(TAG,'ohos.permission.PRIVACY_WINDOW权限申请失败,错误码authResults:`${data.authResults}`');
        }
      }
    });
  }
  addListener_bn():void{
      Logger.info(TAG2,'screenshot addListener_bn');
      const rnInstance=this.ctx.rnInstance;
      try {
        this.windowClass.on('screenshot',()=>{
          rnInstance.emitDeviceEvent('screenshot_did_happen',{})
        });
      } catch (exception) {
        Logger.error('Failed to register callback. Cause: ' + JSON.stringify(exception));
      }
  }
  removeListener_bn():void{
    try {
      // 如果通过on开启多个callback进行监听，同时关闭所有监听：
      this.windowClass.off('screenshot');
    } catch (exception) {
      Logger.error('Failed to unregister callback. Cause: ' + JSON.stringify(exception));
    }
  }
}