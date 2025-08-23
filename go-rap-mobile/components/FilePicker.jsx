import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Image as RNImage, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image as ExpoImage } from "expo-image"; // for GIFs
import { uploadMedia } from "./services/cloudinary";

const FilePicker = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickDocument = async () => {
    setIsLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/jpg", "image/png", "image/jpeg", "image/gif"],
      });

      if (result.canceled) return;

      const file = result.assets ? result.assets[0] : result;
      if (!file?.uri) return;

      setIsLoading(true);
      const url = await uploadMedia(file.uri, file.mimeType || file.type);
      setSelectedFile({ uri: url, type: file.mimeType || file.type });
      console.log("File uploaded:", url);
      
    } catch (error) {
      console.error("File pick/upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
        {/* {{ selectedFile }} */}
      <TouchableOpacity onPress={pickDocument}>
        {isLoading ? (
            <View style={styles.input}>
            <ExpoImage
                source={require("../assets/images/ball-loader.gif")}
                style={{ width: 56, height: 46 }}
                contentFit="contain"
                />
            </View>
        ) : (
            selectedFile ? (
                <RNImage source={{ uri: selectedFile.uri }} style={{ width: 56, height: 46 }} />
            ) : (
                <View style={styles.input}>
                    <RNImage source={require("../assets/images/upload-img.png")} />
                    <Text style={styles.placeholder}>Tap to upload media</Text>
                </View>
                )
            )
        }
      </TouchableOpacity>
    </View>
  );
};

export default FilePicker;

const styles = StyleSheet.create({
    inputFields: {
        flex: 1,
        gap: 16,
        padding: 16,
        backgroundColor: "#fff",
        borderRadius: 8,
    },
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        borderColor: '#ECEBF0',
        borderWidth: 1,
        borderRadius: 8,
        height: 48,
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    placeholder: {
        color: 'gray',
        fontSize: 16,
        textAlign: 'center',
    },
});
