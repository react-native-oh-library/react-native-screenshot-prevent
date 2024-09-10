import type { TurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { TM } from "@rnoh/react-native-openharmony/generated/ts"
import { TurboModule } from '@rnoh/react-native-openharmony/ts'
import window from '@ohos.window';
import abilityAccessCtrl, { Context, PermissionRequestResult } from '@ohos.abilityAccessCtrl';
import { BusinessError } from '@ohos.base';

import Logger from './Logger'
const TAG = 'TestWindowInstance'
const TAG2 = 'TestScreenshotListener'

export class RNScreenShotPreventTurboModule extends TurboModule implements TM.NativeScreenShotPreventNativeModule.Spec {
  constructor(protected ctx: TurboModuleContext) {
    super(ctx);
  }

  async getLastWindowInstance(ctx: Context) {
    const windowInstance = await window.getLastWindow(ctx);
    const windowInfo = windowInstance.getWindowProperties()
    Logger.info(TAG, `获取到 window 实例：${JSON.stringify(windowInfo)}`)
    return windowInstance
  }

  enabled_bn(enabled: boolean): void {
    // 获取权限
    let context: Context = this.ctx.uiAbilityContext;
    let atManager: abilityAccessCtrl.AtManager = abilityAccessCtrl.createAtManager();
    atManager.requestPermissionsFromUser(context, ['ohos.permission.PRIVACY_WINDOW'],
      (err: BusinessError, data: PermissionRequestResult) => {
        if (err) {
          Logger.info(`requestPermissionsFromUser fail, err -> ${JSON.stringify(err)}`);
          return
        }
        Logger.info(TAG, `获取 ohos.permission.PRIVACY_WINDOW 权限信息`);
        Logger.info(TAG, 'data: ' + JSON.stringify(data));
        Logger.info(TAG, 'data permissions: ' + data.permissions);
        Logger.info(TAG, 'data authResults: ' + data.authResults);
        if (!data.authResults.includes(0)) {
          Logger.info(TAG, `ohos.permission.PRIVACY_WINDOW 权限申请失败，错误码 authResults: ${data.authResults}`);
          return
        }
        Logger.info(TAG, 'ohos.permission.PRIVACY_WINDOW 权限申请成功');
        this.getLastWindowInstance(context)
          .then(windowInstance => {
            return windowInstance.setWindowPrivacyMode(enabled);
          }).then(() => {
          Logger.info(TAG, 'Succeeded in setting the window to privacy mode.');
        }).catch((err) => {
          Logger.info(TAG, 'Failed to set the window to privacy mode. Cause: ' + JSON.stringify(err));
        });
      });
  }

  addListener_bn(): void {
    Logger.info(TAG2, 'screenshot addListener_bn');
    this.getLastWindowInstance(this.ctx.uiAbilityContext)
      .then(windowInstance => {
        windowInstance.on('screenshot', () => {
          Logger.info(TAG2, 'screenshot screenshot_did_happen');
          this.ctx.rnInstance.emitDeviceEvent('screenshot_did_happen', {})
        });
      })
      .catch(err => {
        Logger.error('Failed to register callback. Cause: ' + JSON.stringify(err));
      })
  }

  removeListener_bn(): void {
    this.getLastWindowInstance(this.ctx.uiAbilityContext)
      .then(windowInstance => {
        // 如果通过 on 开启多个 callback 进行监听，同时关闭所有监听：
        Logger.info(TAG2, 'screenshot off');
        windowInstance.off('screenshot');
      })
      .catch(err => {
        Logger.error('Failed to unregister callback. Cause: ' + JSON.stringify(err));
      })
  }
}
