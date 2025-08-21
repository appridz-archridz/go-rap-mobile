import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { uploadMedia } from "./services/cloudinary";

const FilePicker = () => {
    const [selectedFile, setSelectedFile] = useState(null);

    const pickDocument = async () => {
        console.log("pickDocument");
        
        const result = await DocumentPicker.getDocumentAsync({
            type: ["image/jpg", "image/png", "image/jpeg"],
        });
        console.log("result", result.assets[0].uri);
        if (result.assets[0].uri) {
            console.log("result.assets[0].uri", result.assets[0].uri);
            
            const url = await uploadMedia(result.assets[0].uri, result.assets[0].type);
            console.log("url", url);
            
            setSelectedFile(result);
        }
    };

    return (
        <View>
            <TouchableOpacity style={styles.input} onPress={pickDocument}>
                <Text style={styles.placeholder}>
                    Tap to upload media
                </Text>
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
        marginBottom: 16,
        textAlign: 'center',
    },
});
