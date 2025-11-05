import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import polyline from "@mapbox/polyline";

let _show, _hide;

export const RoutesModal = () => {
    const [visible, setVisible] = useState(false);
    const [encodedRoute, setEncodedRoute] = useState(null);
    const [onConfirmCb, setOnConfirmCb] = useState(null);

    // OPEN THE MODAL
    _show = ({ encodedRoute, onConfirm }) => {
        setEncodedRoute(encodedRoute || "");
        setOnConfirmCb(() => onConfirm); // store callback
        setVisible(true);
    };

    // CLOSE MODAL
    _hide = () => {
        setVisible(false);
        setTimeout(() => {
            setEncodedRoute(null);
            setOnConfirmCb(null);
        }, 200);
    };

    // USER CLICKED CONFIRM
    const handleConfirm = () => {
        if (onConfirmCb) {
            const fixed = decodeURIComponent(encodedRoute);
            const decoded = polyline.decode(fixed);
            const coords = decoded.map(([latitude, longitude]) => ({ latitude, longitude }));
            onConfirmCb(coords); // return coords to caller
        }
        _hide();
    };

    // Loading State
    if (!encodedRoute && visible) {
        return (
            <Modal visible transparent>
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                </View>
            </Modal>
        );
    }

    // If hidden, don't render anything
    if (!visible) return null;

    // Decode only once (safe)
    const fixed = decodeURIComponent(encodedRoute);
    const decoded = polyline.decode(fixed);
    const coords = decoded.map(([latitude, longitude]) => ({ latitude, longitude }));

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={_hide}
        >
            <View style={styles.backdrop}>
                <View style={styles.sheet}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Route Preview</Text>
                        {/* <TouchableOpacity onPress={_hide}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity> */}
                    </View>

                    {/* Map */}
                    <View style={styles.mapWrap}>
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: coords[0].latitude,
                                longitude: coords[0].longitude,
                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05,
                            }}
                        >
                            <Marker coordinate={coords[0]} title="Start" />
                            <Marker coordinate={coords[coords.length - 1]} title="End" />
                            <Polyline coordinates={coords} strokeWidth={5} strokeColor="blue" />
                        </MapView>
                    </View>

                    {/* Buttons */}
                    <View style={styles.bottomBar}>
                        {/* <TouchableOpacity
                            style={[styles.button, styles.secondary]}
                            onPress={_hide}
                        >
                            <Text style={styles.buttonTextSecondary}>Cancel</Text>
                        </TouchableOpacity> */}

                        <TouchableOpacity
                            style={[styles.button, styles.primary]}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.buttonTextPrimary}>Confirm Route</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

// EXPORT SIMPLE API
export const Routes = {
    show: (params) => _show?.(params),
    hide: () => _hide?.(),
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: "hidden",
        maxHeight: "92%",
    },
    header: {
        paddingTop: Platform.OS === "android" ? 12 : 16,
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#e6e6e6",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    headerTitle: { fontSize: 16, fontWeight: "700" },
    closeText: { color: "#1f6feb", fontWeight: "600" },

    mapWrap: { height: 380, backgroundColor: "#f6f6f6" },
    map: { flex: 1 },

    bottomBar: {
        flexDirection: "row",
        gap: 12,
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "#e6e6e6",
        backgroundColor: "#fff",
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    primary: { backgroundColor: "#1f6feb" },
    secondary: {
        backgroundColor: "#eef3ff",
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#c9d7ff",
    },
    buttonTextPrimary: { color: "#fff", fontWeight: "700" },
    buttonTextSecondary: { color: "#1f6feb", fontWeight: "700" },

    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
