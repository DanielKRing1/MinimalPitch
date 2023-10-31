global.Buffer = require('buffer').Buffer;

import * as Permissions from 'react-native-permissions';
import LiveAudioStream from 'react-native-live-audio-stream';

import {pickPlatformMicPermission} from './permissions';

// RECORDING METHODS
const options = {
  sampleRate: 16000, // default is 44100 but 32000 is adequate for accurate voice recognition
  channels: 1, // 1 or 2, default 1
  bitsPerSample: 16, // 8 or 16, default 16
  audioSource: 1, // android only (see below)
  bufferSize: 2048, // default is 2048
  wavFile: '',
};

export const initAudioStream = async () => {
  await checkPermission();

  LiveAudioStream.init(options);
};

export const startAudioStream = (onData: (base64Chunk: string) => void) => {
  console.log('a');
  LiveAudioStream.on('data', data => {
    // base64-encoded 16 bit audio data chunks
    onData(data);
  });

  console.log('b');
  LiveAudioStream.start();
};

export const stopAudioStream = () => {
  LiveAudioStream.stop();
};

// PERMISSION UTILS

const checkPermission = async () => {
  const status: Permissions.PermissionStatus = await Permissions.check(
    pickPlatformMicPermission(),
  );
  console.log('permission check', status);
  if (status === Permissions.RESULTS.GRANTED) return;
  return requestPermission();
};

const requestPermission = async () => {
  const status: Permissions.PermissionStatus = await Permissions.request(
    pickPlatformMicPermission(),
  );
  console.log('permission request', status);
};
