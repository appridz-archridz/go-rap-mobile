import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { ActivityIndicator, Image as RNImage, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { uploadMedia } from './services/cloudinary';

// Theme object for maintainable colors (aligned with SignUp2)
const theme = {
  primary: '#2094F3',
  border: '#ECEBF0',
  text: {
    primary: 'black',
    secondary: 'gray',
    error: 'red',
    link: '#2094F3',
  },
  background: 'white',
};

const FilePicker = ({ onFileSelected, disabled }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const pickDocument = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpg', 'image/png', 'image/jpeg', 'image/gif'],
      });

      if (result.canceled || !result.assets || !result.assets[0]?.uri) {
        setError('No file selected');
        return;
      }

      const file = result.assets[0];
      if (!file.uri || typeof file.uri !== 'string') {
        setError('Invalid file selected');
        return;
      }

      // Upload to Cloudinary and expect an object with secure_url
      const response = await uploadMedia(file.uri, file.mimeType || file.type);
      if (!response?.secure_url || typeof response.secure_url !== 'string') {
        setError('Failed to upload file: Invalid URL');
        return;
      }

      const fileData = {
        uri: response.secure_url,
        type: file.mimeType || file.type,
        size: file.size || response.bytes, // Include size from Cloudinary response or file
      };
      setSelectedFile(fileData);
      onFileSelected?.(fileData); // Pass file to parent
    } catch (error) {
      const errorMessage = 'Failed to pick or upload file';
      setError(errorMessage);
      console.error('File pick/upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={pickDocument}
        disabled={disabled || isLoading}
        accessibilityLabel="Upload profile picture"
        accessibilityRole="button"
      >
        {isLoading ? (
          <View style={styles.input}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={styles.loadingText}>Uploading...</Text>
          </View>
        ) : selectedFile && selectedFile.uri && typeof selectedFile.uri === 'string' ? (
          <View style={styles.fileContainer}>
            <RNImage
              source={{ uri: selectedFile.uri }}
              style={styles.image}
              resizeMode="contain"
              accessibilityLabel="Selected profile picture"
              onError={(e) => {
                console.error('Image load error:', e.nativeEvent.error);
                setError('Failed to load image');
                setSelectedFile(null); // Reset selected file on error
                onFileSelected?.(null);
              }}
            />
            <View>
              <RNImage
                source={require('../assets/images/red-cross.png')}
                style={styles.closeIcon}
                accessibilityLabel="Close icon"
                onPress={() => {
                  setSelectedFile(null);
                  onFileSelected?.(null);
                }}
              />
            </View>
          </View>
        ) : (
          <View style={styles.input}>
            <RNImage
              source={require('../assets/images/upload-img.png')}
              style={styles.uploadIcon}
              accessibilityLabel="Upload image icon"
            />
            <Text style={styles.placeholder}>Tap to upload media</Text>
          </View>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default FilePicker;

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.background,
  },
  placeholder: {
    color: theme.text.secondary,
    fontSize: 16,
    textAlign: 'center',
  },
  image: {
    width: '48',
    height: 48,
    borderRadius: 8,
  },
  uploadIcon: {
    width: 24,
    height: 24,
  },
  error: {
    color: theme.text.error,
    fontSize: 12,
    marginTop: 4,
  },
  loadingText: {
    color: theme.text.secondary,
    fontSize: 16,
  },
  fileContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  closeIcon: {
    width: 16,
    height: 16,
  }
});