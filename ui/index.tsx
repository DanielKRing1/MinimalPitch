import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';

import MinimalButton from './MinimalButton';

import PitchProcessor from '../engine/PitchProcessor';
import {noteFromPitch} from '../engine/hz';

type MainProps = {};
const Main = (props: MainProps) => {
  // LOCAL STATE
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [pitch, setPitch] = useState<string>('');
  const [pitchProcessor, setPitchProcessor] = useState<PitchProcessor>();

  // LIFECYCLE
  useEffect(() => {
    const startImmediately = true;
    const pp = new PitchProcessor(
      (hz: number) => setPitch(noteFromPitch(hz)),
      startImmediately,
      (newPp: PitchProcessor) => {
        setPitchProcessor(newPp);
        setIsRecording(startImmediately);
      },
    );

    return () => pp.stop();
  }, []);

  // HANDLERS
  const handlePress = () => {
    // 0. Not initialized
    if (!pitchProcessor) return;

    // 1. Execute
    if (!isRecording) pitchProcessor.start();
    else pitchProcessor.stop();

    // 2. Toggle isRecording
    setIsRecording(!isRecording);
  };

  // RENDER
  return (
    <View>
      <MinimalButton onPress={handlePress}>
        <Text style={styles.buttonText}>{pitch}</Text>
        <Text style={styles.buttonText}>{!isRecording ? 'Start' : 'Stop'}</Text>
      </MinimalButton>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    color: 'white', // Change the text color as desired
  },
});

export default Main;
