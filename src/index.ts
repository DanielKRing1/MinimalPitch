import '@tensorflow/tfjs-react-native';
import '@tensorflow/tfjs-react-native/dist/platform_react_native';

import {initAudioStream, startAudioStream, stopAudioStream} from './recording';
import {initModel, processChunk} from './tf';

export const main = async (cb: () => void) => {
  console.log(1);
  await initModel();
  console.log(2);
  await initAudioStream();
  startAudioStream(chunk => processChunk(chunk, cb));

  console.log(3);
  // await new Promise((res, rej) => {
  //   setTimeout(() => res(true), 5000);
  // });

  console.log(4);
  // stopAudioStream();
  console.log(5);
};
