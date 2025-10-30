import { router } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { inputField } from "../global-css";
import { useSelector } from "react-redux";

const eyeOpen = require("../assets/images/eye-open.png");
const eyeClosed = require("../assets/images/eye-closed.png");

export default function ResetPassword() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const selector = useSelector((state) => state.auth);

    const validateField = (field, value) => {
        let message = "";

        if (field === "oldPassword" && !value) {
            message = "Old password is required";
        }

        if (field === "newPassword") {
            if (!value) message = "New password is required";
            else if (value.length < 8)
                message = "Password must be at least 8 characters";
        }

        if (field === "confirmPassword") {
            if (!value) message = "Please confirm your password";
            else if (value !== newPassword) message = "Passwords do not match";
        }

        setErrors((prev) => ({ ...prev, [field]: message }));
    };

    const validate = () => {
        const fields = { oldPassword, newPassword, confirmPassword };
        let allValid = true;

        Object.entries(fields).forEach(([field, value]) => {
            validateField(field, value);
            if (errors[field] || !value) allValid = false;
        });

        return allValid;
    };

    const handleReset = async () => {
        if (!validate()) return;
        console.log("Password reset initiated:", {
            oldPassword,
            newPassword,
            confirmPassword,
        });
        router.push("/login");
    };

    const handleBackToLogin = () => {
        router.push("/login");
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#fff" }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
            >
                {/* Back button (optional placeholder, same layout position) */}
                <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin} />

                <View style={styles.resetContainer}>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>
                        Enter your current password and create a new one.
                    </Text>

                    {/* Old Password */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[inputField, styles.input]}
                                placeholder="Enter old password"
                                placeholderTextColor="#999"
                                secureTextEntry={!showOldPassword}
                                value={oldPassword}
                                onChangeText={(text) => {
                                    setOldPassword(text);
                                    validateField("oldPassword", text);
                                }}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowOldPassword((prev) => !prev)}
                            >
                                <Image
                                    source={showOldPassword ? eyeClosed : eyeOpen}
                                    style={styles.eyeIcon}
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.oldPassword && (
                            <Text style={styles.errorText}>{errors.oldPassword}</Text>
                        )}
                    </View>

                    {/* New Password */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[inputField, styles.input]}
                                placeholder="Enter new password"
                                placeholderTextColor="#999"
                                secureTextEntry={!showNewPassword}
                                value={newPassword}
                                onChangeText={(text) => {
                                    setNewPassword(text);
                                    validateField("newPassword", text);
                                }}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowNewPassword((prev) => !prev)}
                            >
                                <Image
                                    source={showNewPassword ? eyeClosed : eyeOpen}
                                    style={styles.eyeIcon}
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.newPassword && (
                            <Text style={styles.errorText}>{errors.newPassword}</Text>
                        )}
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[inputField, styles.input]}
                                placeholder="Confirm new password"
                                placeholderTextColor="#999"
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    validateField("confirmPassword", text);
                                }}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowConfirmPassword((prev) => !prev)}
                            >
                                <Image
                                    source={showConfirmPassword ? eyeClosed : eyeOpen}
                                    style={styles.eyeIcon}
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.confirmPassword && (
                            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                        )}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity style={styles.button} onPress={handleReset}>
                        <Text style={styles.buttonText}>Update Password</Text>
                    </TouchableOpacity>

                    {
                        !selector.isAuthenticated &&
                        <TouchableOpacity style={styles.linkButton} onPress={handleBackToLogin}>
                            <Text style={styles.linkButtonText}>Back to Login</Text>
                        </TouchableOpacity>
                    }
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    contentContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
    backButton: { position: "absolute", top: 50, left: 20, zIndex: 1, padding: 8 },
    resetContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#000",
        textAlign: "center",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22,
    },
    inputContainer: { width: "100%", marginBottom: 16 },
    inputWrapper: { position: "relative", width: "100%" },
    input: { paddingRight: 48 },
    eyeButton: { position: "absolute", right: 10, top: 10, padding: 4 },
    eyeIcon: { width: 24, height: 24, tintColor: "#2094F3" },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 6,
        alignSelf: "flex-start",
        marginLeft: 6,
    },
    button: {
        height: 52,
        backgroundColor: "#2094F3",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
        width: "100%",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
    },
    linkButton: { marginTop: 16 },
    linkButtonText: { color: "#0057D9", fontSize: 14, fontWeight: "600" },
});
