import {initAudioStream, startAudioStream, stopAudioStream} from './recording';
import {initModel, processChunk} from './tf';

class PitchProcessor {
  isReady: boolean = false;
  isRecording: [boolean];
  cb: (hz: number) => void = () => {};

  constructor(
    cb: (hz: number) => void,
    startImmediately: boolean,
    onInitCb: (pp: PitchProcessor) => void,
  ) {
    this.isRecording = [false];

    (async () => {
      await initModel();
      await initAudioStream();

      this.isReady = true;
      onInitCb(this);

      if (startImmediately) this.start(cb);
    })();
  }

  start(newCb?: (hz: number) => void) {
    if (this.isRecording[0]) throw new Error('PitchRecorder already started!');
    if (!this.isReady) throw new Error('PitchProcessor not ready yet!');

    console.log('aaa');

    if (newCb) this.cb = newCb;

    startAudioStream(chunk =>
      processChunk(chunk, (hz: number) => {
        if (this.isRecording[0]) this.cb(hz);
      }),
    );

    this.isRecording = [true];
  }

  stop() {
    stopAudioStream();

    this.isRecording = [false];
  }
}

export default PitchProcessor;
