import * as Permissions from 'react-native-permissions';

import {pickPlatformHandler} from './platform';

export const pickPlatformMicPermission = (): Permissions.Permission => {
  const permission: Permissions.Permission =
    pickPlatformHandler<Permissions.Permission>(
      Permissions.PERMISSIONS.IOS.MICROPHONE,
      Permissions.PERMISSIONS.ANDROID.RECORD_AUDIO,
      Permissions.PERMISSIONS.WINDOWS.MICROPHONE,
    );
  return permission;
};
