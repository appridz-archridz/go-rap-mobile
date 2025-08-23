import { Image, StyleSheet, Text, TouchableHighlight, View } from "react-native";

const PressableButton = ({customStyles, text, onPress, rightArrow = false}) => {
    const styles = StyleSheet.create({
        button: {
            height: customStyles.height || 56,
            backgroundColor: customStyles.bgColor || '#2094F3FF',
            paddingVertical: 12,
            borderRadius: customStyles.borderRadius || 10,
            padding:10
        },
        text: {
            fontFamily: 'work-sans-bold',
            color: customStyles.color || '#fff',
            fontSize: customStyles.fontSize || 20,
            textAlign: 'center',
        },
        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 5
        }
    })

    return (
        <TouchableHighlight style={styles.button} onPress={onPress}>
            <View style={styles.center}>
                <Text style={styles.text}>{text}</Text>
                {rightArrow && (
                    <Image
                        source={require('../assets/images/right-arrow.png')}
                        style={{ width: 20, height: 20 }}
                    />
                )}
            </View>
        </TouchableHighlight>
    )
}

export default PressableButton;
