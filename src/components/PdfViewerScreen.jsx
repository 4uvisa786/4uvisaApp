import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';

export default function PdfViewerScreen({ route }) {
  const { url } = route.params; // pass doc.url here

  return (
    <View style={styles.container}>
      <Pdf
        source={{ uri: url, cache: true }}
        style={styles.pdf}
        onError={(error) => {
          console.log('PDF load error:', error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pdf: { flex: 1, width: Dimensions.get('window').width, height: Dimensions.get('window').height }
});
