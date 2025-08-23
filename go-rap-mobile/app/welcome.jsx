import { router } from "expo-router";
import { Image, Pressable } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import PressableButton from "../components/PressableButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";

const Welcome = () => {

    const dispatch = useDispatch();

    const GetStartedOnPress = () => {
        const payload = {
            token: "abc123xyz",
            userDetails: {
                username: "ranadeep",
                email: "ranadeep@example.com",
                phone: "9121923255",
            },
        };
        dispatch(login(payload));
        router.push("/signup");
    }

    customStyles = {
        bgColor: '#2094F3',
        color: '#fff'
    }

    return (
        <SafeAreaView style={styles.container}>
            <View></View>
            <View style={styles.content}>
                <Image style={{ width: 120, height: 120 }} source={require('../assets/images/dummy-img.png')} />
                <Text style={styles.heading}>
                    <Text>Your Journey, Our Wheels.</Text>
                </Text>
                <Text style={styles.caption}>
                    <Text>Reliable, Fast, and Affordable Rides at Your Fingertips.</Text>
                </Text>
            </View>
            <PressableButton customStyles={customStyles} text="Get Started" onPress={GetStartedOnPress} />
        </SafeAreaView>
    );
}

export default Welcome;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'stretch',
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontSize: 36,
        color: '#242524FF',
        textAlign: 'center',
        lineHeight: 45,
        fontFamily: 'work-sans-bold',
    },
    caption: {
        fontSize: 18,
        fontWeight: '400',
        color: '#8C8D8BFF',
        textAlign: 'center',
        lineHeight: 28,
        padding: 25,
        fontFamily: 'work-sans-regular',
    }
});