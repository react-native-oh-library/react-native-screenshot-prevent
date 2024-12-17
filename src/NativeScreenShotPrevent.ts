/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry} from 'react-native';
type FN = (resp: any) => void
type Return = {
    readonly remove: () => void
}
export interface Spec extends TurboModule {
    enabled_bn(enabled: boolean):void;
    addListener_bn():void;
    removeListener_bn():void;
} 
 
export default TurboModuleRegistry.get<Spec>('NativeScreenShotPreventNativeModule') as Spec | null;