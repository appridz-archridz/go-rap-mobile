import { useState } from 'react';

export default function Camera({ showCamera }) {

    const [showCamera, setShowCamera] = useState(showCamera);

    return (
        <View>
            <Text>Camera</Text>
            {showCamera && (
                <View style={styles.cameraContainer}>
                    <CameraView
                        style={styles.camera}
                        facing={cameraFacing}
                        ref={cameraRef}
                        ratio="16:9"
                        flashMode="on"
                        autoFocus="on"
                        whiteBalance="auto"
                    />
                    <View style={styles.cameraControls}>
                        <Button
                            title="Capture"
                            onPress={takePicture}
                            color="#007AFF"

                        >
                            <Ionicons name="camera" size={30} color="white" />
                        </Button>

                        <Button
                            title="Close"
                            onPress={closeCamera}
                            color="#FF3B30"
                        >
                            <Ionicons name="close" size={30} color="white" />
                        </Button>

                        <Button
                            title="Flip"
                            onPress={
                                () =>
                                    setCameraFacing(
                                        cameraFacing === "front" ? "back" : "front"
                                    )
                            }
                            color="#34C759"
                        >
                            <Ionicons name="refresh" size={30} color="white" />
                        </Button>
                    </View>
                </View>
            )}
        </View>
    )
}
