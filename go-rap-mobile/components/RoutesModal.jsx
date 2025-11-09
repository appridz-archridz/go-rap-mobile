import polyline from "@mapbox/polyline";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker, Polyline as RouteLine } from "react-native-maps";

let _show, _hide;

export const RoutesModal = () => {
    const [visible, setVisible] = useState(false);
    const [encodedRoute, setEncodedRoute] = useState(null);
    const [onConfirmCb, setOnConfirmCb] = useState(null);
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);
    const [path, setPath] = useState("");
    const mapRef = useRef(null);

    // ✅ OPEN THE MODAL
    _show = ({ encodedRoute, from, to, onConfirm }) => {
        setEncodedRoute(encodedRoute || "");
        setFrom(from);
        setTo(to);
        setOnConfirmCb(() => onConfirm);
        setVisible(true);
    };

    // ✅ CLOSE MODAL
    _hide = () => {
        setVisible(false);
        setTimeout(() => {
            setEncodedRoute(null);
            setOnConfirmCb(null);
            setPath("");
            setFrom(null);
            setTo(null);
        }, 200);
    };

    // ✅ USER CLICKED CONFIRM
    const handleConfirm = () => {
        try {
            if (!encodedRoute || !from || !to) return;

            const decoded = polyline.decode(decodeURIComponent(encodedRoute)) || [];
            decoded.unshift([from.lat, from.lng]);
            decoded.push([to.lat, to.lng]);

            const pathStr = decoded.map(([lat, lng]) => `${lat},${lng}`).join(";");
            setPath(pathStr);
        } catch (err) {
            console.error("Error decoding polyline:", err);
        }
    };

    // ✅ When path is ready, call parent callback
    useEffect(() => {
        if (path && onConfirmCb) {
            onConfirmCb(path);
            _hide();
        }
    }, [path]);

    // ✅ Loading / fallback state
    if (visible && !encodedRoute) {
        return (
            <Modal visible transparent>
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                    <Text style={{ marginTop: 10 }}>Loading route...</Text>
                </View>
            </Modal>
        );
    }

    // ✅ If hidden, don't render anything
    if (!visible) return null;

    // ✅ Decode route safely
    let coords = [];
    try {
        const fixed = decodeURIComponent(encodedRoute);
        const decoded = polyline.decode(fixed);
        coords = decoded.map(([latitude, longitude]) => ({ latitude, longitude }));
    } catch (err) {
        console.error("Invalid polyline:", err);
    }

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
                    </View>

                    {/* Map Section */}
                    <View style={styles.mapWrap}>
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            onLayout={() => {
                                if (coords.length > 1 && mapRef.current) {
                                    mapRef.current.fitToCoordinates(coords, {
                                        edgePadding: { top: 50, bottom: 50, left: 50, right: 50 },
                                        animated: true,
                                    });
                                }
                            }}
                            initialRegion={{
                                latitude: coords[0]?.latitude || 17.385,
                                longitude: coords[0]?.longitude || 78.4867,
                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05,
                            }}
                        >
                            {coords.length > 0 && (
                                <>
                                    <Marker coordinate={coords[0]} title="Start" />
                                    <Marker coordinate={coords[coords.length - 1]} title="End" />
                                    <RouteLine
                                        coordinates={coords}
                                        strokeWidth={5}
                                        strokeColor="blue"
                                    />
                                </>
                            )}
                        </MapView>
                    </View>

                    {/* Buttons */}
                    <View style={styles.bottomBar}>
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

// ✅ EXPORT CONTROL API
export const Routes = {
    show: (params) => _show?.(params),
    hide: () => _hide?.(),
};

// ✅ STYLES
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
    buttonTextPrimary: { color: "#fff", fontWeight: "700" },

    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
