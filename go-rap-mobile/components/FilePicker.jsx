import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image as RNImage,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
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

      // Upload to Cloudinary
      const response = await uploadMedia(file.uri, file.mimeType || file.type);

      const fileUrl = response?.secure_url || response?.url;
      if (!fileUrl || typeof fileUrl !== 'string') {
        setError('Failed to upload file: Invalid URL');
        return;
      }

      const fileData = {
        uri: fileUrl,
        type: file.mimeType || file.type,
        size: file.size || response.bytes || null,
      };

      setSelectedFile(fileData);
      onFileSelected?.(fileData);
    } catch (err) {
      setError('Failed to pick or upload file');
      console.error('File pick/upload error:', err);
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
        ) : selectedFile && selectedFile.uri ? (
          <View style={styles.fileContainer}>
            <RNImage
              source={{ uri: selectedFile.uri }}
              style={styles.image}
              resizeMode="cover"
              accessibilityLabel="Selected profile picture"
            />
            <TouchableOpacity
              onPress={() => {
                setSelectedFile(null);
                onFileSelected?.(null);
              }}
            >
              <RNImage
                source={require('../assets/images/red-cross.png')}
                style={styles.closeIcon}
                accessibilityLabel="Remove file"
              />
            </TouchableOpacity>
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
    width: 48,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  closeIcon: {
    width: 16,
    height: 16,
  },
});
