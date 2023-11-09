import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';

type MinimalButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
};
const MinimalButton = (props: MinimalButtonProps) => {
  const {onPress, children} = props;

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '50%', // Adjust the width and height as needed
    height: '50%',
    borderRadius: 500, // Make it a circle by setting borderRadius to half of the width/height
    backgroundColor: 'grey', // Change the background color as desired
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MinimalButton;
