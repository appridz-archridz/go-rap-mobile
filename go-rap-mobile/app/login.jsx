import { router } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

const Login = () => {
    return (
        <View>
            <Text onPress={() => router.push("/signup")} >Login</Text>
        </View>
    )
}

export default Login;
