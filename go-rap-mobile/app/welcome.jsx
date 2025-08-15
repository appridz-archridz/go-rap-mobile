import { router } from "expo-router";
import { Pressable } from "react-native";
import { Button } from "react-native";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

const Welcome = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text style={styles.heading}>
                    <Text>Your Journey, Our Wheels.</Text>
                </Text>
                <Text style={styles.caption}>
                    <Text>Reliable, Fast, and Affordable Rides at Your Fingertips.</Text>
                </Text>
            </View>
            <Pressable onPress={() => router.push("/signup")}>
                <Text style={styles.button}>Get Started</Text>
            </Pressable>
        </SafeAreaView>
    );
}

export default Welcome;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        paddingHorizontal: 20,
    },
    heading: {
        fontWeight: '800',
        fontSize: 36,
        color: '#242524FF',
        textAlign: 'center',
        lineHeight: 45,
    },
    caption: {
        fontSize: 18,
        fontWeight: '400',
        color: '#8C8D8BFF',
        textAlign: 'center',
        lineHeight: 28,
        padding: 35,
    },
    button: {
        backgroundColor: '#2094F3FF',
        paddingVertical: 12,
        borderRadius: 10,
        color: '#fff',
        fontWeight: '700',
        fontSize: 20,
        textAlign: 'center',
        ':hover': {
            backgroundColor: '#074A81FF'
        }
    },
});