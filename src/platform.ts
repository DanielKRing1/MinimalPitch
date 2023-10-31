import {Platform} from 'react-native';

export function pickPlatformHandler<T>(
  iosHandler: T,
  androidHandler: T,
  windowsHandler: T,
) {
  switch (Platform.OS) {
    case 'ios':
    case 'macos':
      return iosHandler;

    case 'android':
      return androidHandler;

    case 'windows':
      return windowsHandler;

    default:
      throw new Error(`Unaccounted Platform OS: ${Platform.OS}`);
  }
}
