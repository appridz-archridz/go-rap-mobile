import { createContext, useContext, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("Loading...");

    const showLoader = (msg = null) => {
        setMessage(msg);
        setLoading(true);
    };

    const hideLoader = () => {
        setLoading(false);
    };

    return (
        <LoaderContext.Provider value={{ showLoader, hideLoader }}>
            {children}

            {loading && (
                <View style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 9999
                }}>
                    <View style={{
                        backgroundColor: "#fff",
                        padding: 20,
                        borderRadius: 12,
                        alignItems: "center"
                    }}>
                        <ActivityIndicator size="large" color="#2094F3" />
                        {/* <Text style={{ marginTop: 10, color: "black" }}>{message}</Text> */}
                    </View>
                </View>
            )}
        </LoaderContext.Provider>
    );
};

export const useLoader = () => useContext(LoaderContext);
