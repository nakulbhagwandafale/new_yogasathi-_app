import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { analyzeYogaPosture } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';

const PRACTICE_DURATION_SECONDS = 60;
const FRAME_CAPTURE_INTERVAL_MS = 5000;

export default function PracticeCameraScreen() {
    const { poseName } = useLocalSearchParams();
    const { theme } = useTheme();
    const [permission, requestPermission] = useCameraPermissions();
    const [timeLeft, setTimeLeft] = useState(PRACTICE_DURATION_SECONDS);
    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const cameraRef = useRef(null);
    const framesRef = useRef([]);
    const intervalRef = useRef(null);
    const timerRef = useRef(null);
    const isRecordingRef = useRef(false);

    // Initial check for permissions
    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isRecordingRef.current = false;
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const captureFrame = async () => {
        if (!isRecordingRef.current || !cameraRef.current) return;
        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.5,
                base64: true,
                exif: false,
            });
            
            if (photo && photo.base64 && isRecordingRef.current) {
                framesRef.current.push(photo.base64);
            }
        } catch (err) {
            // Only log if we're still actively recording — ignore errors after session ends
            if (isRecordingRef.current) {
                console.warn('Failed to capture frame:', err);
            }
        }
    };

    const stopIntervals = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const startSession = () => {
        isRecordingRef.current = true;
        setIsRecording(true);
        framesRef.current = []; // Reset frames
        setTimeLeft(PRACTICE_DURATION_SECONDS);

        // Immediate first capture
        captureFrame();

        // Start interval for capturing frames every 5 seconds
        intervalRef.current = setInterval(() => {
            captureFrame();
        }, FRAME_CAPTURE_INTERVAL_MS);

        // Start countdown timer
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    finishSession();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const finishSession = async () => {
        // Guard against double-invocation
        if (!isRecordingRef.current) return;
        isRecordingRef.current = false;

        // Stop intervals immediately before any async work
        stopIntervals();
        setIsRecording(false);

        if (framesRef.current.length === 0) {
            Alert.alert('Error', 'Failed to capture any frames. Please try again.');
            router.back();
            return;
        }

        setIsAnalyzing(true);
        try {
            const result = await analyzeYogaPosture(poseName, framesRef.current);
            if (result.success) {
                router.replace({
                    pathname: '/practice-result',
                    params: { 
                        poseName: poseName,
                        analysisRaw: JSON.stringify(result.data) 
                    }
                });
            } else {
                Alert.alert('Analysis Failed', result.error);
                router.back();
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Something went wrong during analysis.');
            router.back();
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCancel = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        router.back();
    };

    if (!permission) {
        return <View style={[styles.container, { backgroundColor: theme.background }]} />;
    }

    if (!permission.granted) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <Text style={[styles.message, { color: theme.text }]}>We need your permission to show the camera</Text>
                <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={requestPermission}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.outlineBtn, { borderColor: theme.border }]} onPress={handleCancel}>
                    <Text style={[styles.outlineBtnText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (isAnalyzing) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <LoadingSpinner />
                <Text style={[styles.analyzingText, { color: theme.text }]}>
                    Analyzing your {poseName} form...
                </Text>
                <Text style={[styles.analyzingSubText, { color: theme.textSecondary }]}>
                    Our AI is reviewing your posture progression. This usually takes around 10-15 seconds.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView 
                style={styles.camera} 
                facing="front" 
                ref={cameraRef}
                autofocus="on"
            />
            <View style={StyleSheet.absoluteFill}>
                {/* Header overlay */}
                <View style={styles.overlayHeader}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.poseTag}>
                        <Text style={styles.poseTagText}>{poseName}</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                {/* Center / Timer overlay */}
                <View style={styles.overlayCenter}>
                    {isRecording && (
                        <View style={styles.timerCircle}>
                            <Text style={styles.timerText}>{timeLeft}</Text>
                        </View>
                    )}
                </View>

                {/* Footer / Controls overlay */}
                <View style={styles.overlayFooter}>
                    {!isRecording ? (
                        <TouchableOpacity style={styles.recordStartBtn} onPress={startSession}>
                            <View style={styles.recordStartInner} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.recordStopBtn} onPress={finishSession}>
                            <View style={styles.recordStopInner} />
                        </TouchableOpacity>
                    )}
                    <Text style={styles.footerInstruction}>
                        {!isRecording 
                            ? "Position your device and tap to start 1-minute session" 
                            : "Recording your form. Keep holding the pose!"}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    message: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16,
    },
    btn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 10,
        width: '100%',
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    outlineBtn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        width: '100%',
        alignItems: 'center',
    },
    outlineBtnText: {
        fontWeight: '600',
        fontSize: 16,
    },
    analyzingText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    analyzingSubText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    camera: {
        flex: 1,
    },
    overlayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    cancelBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    poseTag: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    poseTagText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    overlayCenter: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    timerText: {
        color: '#fff',
        fontSize: 48,
        fontWeight: 'bold',
    },
    overlayFooter: {
        paddingBottom: 50,
        alignItems: 'center',
    },
    recordStartBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#fff',
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    recordStartInner: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        backgroundColor: '#ef4444', 
    },
    recordStopBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#fff',
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    recordStopInner: {
        width: 32,
        height: 32,
        borderRadius: 4,
        backgroundColor: '#ef4444', 
    },
    footerInstruction: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
});
