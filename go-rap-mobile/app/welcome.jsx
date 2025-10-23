import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import PressableButton from "../components/PressableButton";
import { HelperService } from "../services/helper-service";

const Welcome = () => {

    const dispatch = useDispatch();

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const token = await AsyncStorage.getItem("token");

                if (token) {
                    HelperService.setToken(token);
                }
            } catch (error) {
                console.error("Error fetching token:", error);
            }
        };
        fetchToken();
    }, []);


    const GetStartedOnPress = () => {
        console.log('Bye from welcome.jsx -> GetStartedOnPress()');
        
        router.push("/login");
    }

    const customStyles = {
        bgColor: '#2094F3',
        color: '#fff'
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* <View></View> */}
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