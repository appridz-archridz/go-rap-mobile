import { Pressable, StyleSheet, Text, View } from "react-native";

const PressableButton = ({customStyles={}, text="Button", onPress={}}) => {
    
    const styles = StyleSheet.create({
        button: {
            backgroundColor: customStyles.bgColor || '#2094F3FF',
            paddingVertical: 12,
            borderRadius: customStyles.borderRadius || 10,
            ':hover': {
                backgroundColor: customStyles.hoverColor || '#074A81FF'
            }
        },
        text: {
            fontFamily: 'work-sans-bold',
            color: customStyles.color || '#fff',
            fontSize: customStyles.fontSize || 20,
            textAlign: 'center',
        }
    })

    return (
        <View>
            <Pressable style={styles.button} onPress={onPress} >
                <Text style={styles.text}> {text} </Text>
            </Pressable>
        </View>
    )
}

export default PressableButton;
