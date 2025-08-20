import * as DocumentPicker from "expo-document-picker";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const FilePicker = () => {
    // const [selectedFile, setSelectedFile] = useState(null);

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
        });
        if (result.type === "success") {
            setSelectedFile(result);
        }
    };

    return (
        <View>
            <TouchableOpacity style={styles.input}>
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
