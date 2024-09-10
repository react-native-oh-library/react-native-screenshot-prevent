import type { TurboModuleContext,RNOHContext } from '@rnoh/react-native-openharmony/ts';
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
  }
  private windowClass:undefined|window.Window;

  initialize(callback:Function){
    //获取window class实例并执行回调
    let ctx=this.ctx.uiAbilityContext;
    try {
      let promise = window.getLastWindow(ctx);
      promise.then((data) => {
        // 执行回调函数
        callback&&callback(data);
      }).catch((err) => {
        Logger.info(TAG, `Failed to obtain the top window. Cause: ：${JSON.stringify(err)}`);
      });
    } catch (exception) {
      console.error('Failed to obtain the top window. Cause: ' + JSON.stringify(exception));
    }
  }
  setEnabled(enabled:boolean):void{
    let that=this;
    // 获取接口权限并执行对应接口
    let atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();
    let context: Context = this.ctx.uiAbilityContext;
    atManager.requestPermissionsFromUser(context, ['ohos.permission.PRIVACY_WINDOW'], (err: BusinessError, data: PermissionRequestResult)=>{
      if (err) {
        Logger.info(`Failed to requestPermissionsFromUser, err->${JSON.stringify(err)}`);
      } else {
        if(data.authResults.includes(0)){
          Logger.info(TAG,'Success to obtain ohos.permission.PRIVACY_WINDOW权限');
          try {
              let promise = that.windowClass.setWindowPrivacyMode(enabled);
              promise.then(()=> {
                Logger.info(TAG,`Success to ${enabled?'开启':'关闭'} the window to privacy mode.`);
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

  enabled_bn(enabled: boolean):void{
    let that=this;
    if(!this.windowClass){
      this.initialize((data)=>{
        //获取window class实例
        that.windowClass = data;
        Logger.info(TAG2, `Success to obtain the top window：${JSON.stringify(data)}`);
        that.setEnabled(enabled);
      })
    }else{
      that.setEnabled(enabled);
    }
  }
  openListener(){
    //监听screenshot事件并通知RN侧
    const rnInstance=this.ctx.rnInstance;
    try {
      Logger.info(TAG2, `Success to open screenshot listener`);
      this.windowClass.on('screenshot',()=>{
        rnInstance.emitDeviceEvent('screenshot_did_happen',{})
      });
    } catch (exception) {
      Logger.error('Failed to register callback. Cause: ' + JSON.stringify(exception));
    }
  }
  addListener_bn():void{
      let that=this;
      if(!this.windowClass){
        this.initialize((data)=>{
          //获取window class实例
          that.windowClass = data;
          Logger.info(TAG2, `Success to obtain the top window：${JSON.stringify(data)}`);
          that.openListener();
        })
      }else{
        that.openListener();
      }
  }
  removeListener_bn():void{
    if(this.windowClass){
      try {
        // 如果通过on开启多个callback进行监听，同时关闭所有监听：
        this.windowClass.off('screenshot');
        Logger.info(TAG2, `Success to close screenshot listener`);
      } catch (exception) {
        Logger.error('Failed to unregister callback. Cause: ' + JSON.stringify(exception));
      }
    }
  }
}