/**
 * Restaurant Discovery App
 * Entry point — wraps the app in GestureHandlerRootView (required by @gorhom/bottom-sheet)
 */

import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import MapScreen from './src/screens/MapScreen';

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <MapScreen />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
