import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import '@tensorflow/tfjs-react-native/dist/platform_react_native';
import {getPitchHz} from './hz';
import {bundleResourceIO} from '@tensorflow/tfjs-react-native';

const modelJson = require('../model/model.json');
const modelWeights1 = require('../model/group1-shard1of3.bin');
const modelWeights2 = require('../model/group1-shard2of3.bin');
const modelWeights3 = require('../model/group1-shard3of3.bin');

let model: tf.GraphModel;
export const initModel = async () => {
  // console.log('abt to await');
  await tf.setBackend('rn-webgl');
  await tf.ready();
  // console.log('awaited');
  // console.log(tf.getBackend());

  // const MODEL_URL = 'https://tfhub.dev/google/tfjs-model/spice/2/default/1';
  // model = await tf.loadGraphModel(MODEL_URL, {fromTFHub: true});

  model = await tf.loadGraphModel(
    bundleResourceIO(modelJson, [modelWeights1, modelWeights2, modelWeights3]),
  );
};

// Sample lengths of 512
const SAMPLE_SET_LEN = 512;
const data: Float32Array[] = [];
const addSampleSet = () => {
  data.push(new Float32Array(SAMPLE_SET_LEN));
  offset = 0;
};
let offset: number = 0;
// export const processChunk = (chunk: Buffer) => {
//   // 1. Make sure there is an initial Float32Array
//   if (data.length === 0) addSampleSet();

//   // 2. Received enough data to create a new sample set
//   if (chunk.length >= SAMPLE_SET_LEN) {
//     // Throw away all existing data
//     while (data.length > 1) data.pop();

//     // Add latest complete sample set into data (since only a single sample set is processed for each call to this method)
//     const latestSampleSet = data[data.length - 1];
//     const newSampleSet = chunk.subarray(
//       chunk.length - SAMPLE_SET_LEN,
//       chunk.length,
//     );
//     latestSampleSet.set(newSampleSet);

//     // Reset offset
//     addSampleSet();
//   }
//   // 3. Continue building a complete sample set
//   else {
//     let chunkPointer = 0;
//     while (chunkPointer < chunk.length) {
//       // Add to existing sample set
//       const latestSampleSet = data[data.length - 1];
//       const remainingSpace = SAMPLE_SET_LEN - offset;
//       const countToCopy = Math.min(remainingSpace, chunk.length - chunkPointer);

//       const chunkToCopy = chunk.subarray(
//         chunkPointer,
//         chunkPointer + countToCopy,
//       );
//       latestSampleSet.set(chunkToCopy, offset);
//       chunkPointer += countToCopy;
//       offset += countToCopy;

//       // If completed sample set, add new one
//       if (offset >= SAMPLE_SET_LEN) addSampleSet();
//     }
//   }

//   // 4. Only process latest complete sample set -> Remove prev complete sample sets
//   while (data.length > 2) {
//     data.shift();
//   }

//   // 5. Process latest complete sample set
//   if (data[0].length === SAMPLE_SET_LEN)
//     processPitch(data.shift() as Float32Array);

//   // console.log(chunk.length);
// };

let isReady = true;

export const processChunk = async (
  base64Chunk: string,
  onSuccessfulProcess: (hz: number) => void,
) => {
  if (!isReady) return;
  isReady = false;

  const chunk = Buffer.from(base64Chunk, 'base64');

  const dataView: DataView = new DataView(chunk.buffer);
  const asFloats: Float32Array = new Float32Array(SAMPLE_SET_LEN);

  // const i = {
  //   bits: 16, // Assuming int16
  //   min: -32768, // Assuming int16
  // };
  // const absMax = Math.pow(2, i.bits - 1);
  // const offset = i.min + absMax;

  // for (let i = 0; i < SAMPLE_SET_LEN; i++) {
  //   asFloats[i] = (asInt16[i] - offset) / absMax;
  // }

  for (let i = 0; i < SAMPLE_SET_LEN; i++) {
    // Read the 16-bit PCM value (little-endian)
    const int16 = dataView.getInt16(i * 2, true);

    // Convert and store the value as a Float32
    asFloats[i] = int16 / 32768; // Normalize to the range [-1.0, 1.0]
  }

  // for (let i = 0; i < SAMPLE_SET_LEN; i++) {
  //   asFloats[i] = chunk[i] / 255;
  // }

  // // Iterate through the 8-bit buffer and concatenate pairs into 16-bit values
  // for (let i = 0; i < SAMPLE_SET_LEN; i++) {
  //   let value16 = (chunk[2 * i] << 8) | chunk[2 * i + 1];
  //   // Check the sign bit (most significant bit)
  //   if (value16 & 0x8000) {
  //     // If it's set (negative), extend the sign
  //     value16 |= 0xffff0000;
  //   }

  //   asFloats[i] = value16 / 32768;
  // }

  // // console.log(chunk);

  // // console.log(chunk.subarray(0, 5));
  // // console.log(new Int8Array(chunk.subarray(0, 5)));
  // // console.log(chunk.subarray(0, 5).map(v => convertUnsignedToSigned(v, 8)));

  const s = Date.now();
  const [uncertainties, pitches] = await processPitch(asFloats);
  console.log(`ProcessPitch time: ${Date.now() - s}`);

  let mostCertainty = 0;
  let mostCertain = -1;
  for (let i = 0; i < pitches.length; ++i) {
    let confidence = 1.0 - uncertainties[i];
    if (confidence > mostCertainty) {
      mostCertainty = confidence;
      mostCertain = i;
    }
  }

  console.log(getPitchHz(pitches[mostCertain]));
  console.log(getPitchHz(pitches[pitches.length - 1]));
  console.log(pitches.map(p => getPitchHz(p)));
  console.log(uncertainties);

  // console.log('\n\n\n\n');
  // console.log(asFloats);
  // console.log('\n\n\n\n');

  const hz: number = getPitchHz(pitches[mostCertain]);
  onSuccessfulProcess(hz);

  setTimeout(() => {
    isReady = true;
  }, 1000 / 60);

  // setTimeout(() => {
  //   // let start;
  //   // // console.log(Date.now());
  //   // start = Date.now();
  //   // const dv: DataView = new DataView(chunk.buffer);
  //   // const af: Float32Array = new Float32Array(SAMPLE_SET_LEN);
  //   // for (let i = 0; i < SAMPLE_SET_LEN / 2; i++) {
  //   //   // Read the 32-bit PCM value (little-endian)
  //   //   const int16 = dv.getInt16(i * 2, true);
  //   //   // Convert and store the value as a Float32
  //   //   af[i] = int16 / 32768; // Normalize to the range [-1.0, 1.0]
  //   // }
  //   // // console.log('\n\nhere');
  //   // // console.log(Date.now() - start);
  //   // start = Date.now();
  //   // const unsignedBitsMax = Math.pow(2, 16);
  //   // const signedBitsMax = Math.pow(2, 15);
  //   // // WHY DOESNT THIS WORK??
  //   // // JUST CURIOUS...
  //   // // DATAVIEW.READINT16 WORKS, BUT CONVERTING EACH PAIR OF 2 BYTES INTO AN INT16 DOES NOT WORK
  //   // const af2: Float32Array = new Float32Array(SAMPLE_SET_LEN / 2);
  //   // for (let i = 0; i < SAMPLE_SET_LEN / 2; i++) {
  //   //   // Read the 16-bit PCM value (little-endian)
  //   //   let int16 = (chunk[2 * i + 1] << 8) | chunk[2 * i];
  //   //   int16 = convertUnsignedToSigned16(int16);
  //   //   // int16 = int16 >= signedBitsMax ? int16 - unsignedBitsMax : int16;
  //   //   // Convert and store the value as a Float32
  //   //   af2[i] = int16 / 32768; // Normalize to the range [-1.0, 1.0]
  //   // }
  //   // // console.log(Date.now() - start);
  //   // // console.log(af.slice(0, 5));
  //   // // console.log(af2.slice(0, 5));
  //   // // console.log('\n\n\n\n');
  // }, 250);
};

const unsignedBitsMax = Math.pow(2, 16);
const signedBitsMax = Math.pow(2, 15);
function convertUnsignedToSigned16(uint: number) {
  return uint >= signedBitsMax ? uint - unsignedBitsMax : uint;
}

function convertUnsignedToSigned(uint: number, bits: number) {
  return uint >= Math.pow(2, bits - 1) ? uint - Math.pow(2, bits) : uint;
}

// let lastTimestamp = Date.now();
// The array length should be a multiple of 512 (32ms at 16kHz sampling rate).
const processPitch = async (inputData: Float32Array) => {
  // // console.log('About to process pitch');
  // // console.log(inputData.slice(0, 5));

  // let s = Date.now();
  const input: tf.Tensor<tf.Rank> = tf.reshape(tf.tensor(inputData), [
    SAMPLE_SET_LEN,
  ]);
  // console.log(`Reshape time: ${Date.now() - s}`);

  // s = Date.now();
  const output: tf.Tensor<tf.Rank>[] = model.execute({
    input_audio_samples: input,
  }) as tf.Tensor<tf.Rank>[];
  // console.log(`Execute time: ${Date.now() - s}`);

  const uncertaintiesPromise: Promise<Float32Array> =
    output[0].data() as Promise<Float32Array>;
  const pitchesPromise: Promise<Float32Array> =
    output[1].data() as Promise<Float32Array>;

  // s = Date.now();
  const [uncertainties, pitches] = await Promise.all([
    uncertaintiesPromise,
    pitchesPromise,
  ]);
  // console.log(`Data time: ${Date.now() - s}`);

  return [uncertainties, pitches];

  // console.log(noteFromPitch(getPitchHz(pitches[mostCertain])));
  // console.log(pitches.map(p => getPitchHz(p)));
  // console.log(uncertainties);
  // console.log(`\n\nTime: ${Date.now() - lastTimestamp}\n\n`);
  // lastTimestamp = Date.now();
};
