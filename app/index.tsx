import { Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useSetAtom } from "jotai";
import { analysisAtom } from "@/atoms/analysis";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
  Easing,
  withSpring,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import LottieView from "lottie-react-native";

export default function Index() {
  const router = useRouter();
  const setAnalysis = useSetAtom(analysisAtom);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const borderProgress = useSharedValue(0);
  useEffect(() => {
    borderProgress.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      ["#ff5f6d", "#4facfe"]
    ),
    shadowColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      ["#ff8008", "#4facfe"]
    ),
  }));

  const animatedBg = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      ["#ff5f6d", "#4facfe"]
    ),
    backgroundColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      ["rgba(255, 128, 0, 0.1)", "rgba(79, 172, 254, 0.1)"]
    ),
    shadowColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      ["#ff8008", "#4facfe"]
    ),
  }));

  const button1Scale = useSharedValue(1);
  const button2Scale = useSharedValue(1);

  const animatedButton1Style = useAnimatedStyle(() => ({
    transform: [{ scale: button1Scale.value }],
  }));

  const animatedButton2Style = useAnimatedStyle(() => ({
    transform: [{ scale: button2Scale.value }],
  }));

  const handlePressIn = (scale) => {
    scale.value = withSpring(0.95);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = (scale) => {
    scale.value = withSpring(1);
  };

  const resetError = () => {
    setError(null);
  };

  const captureImage = async (camera = false) => {
    let result;
    try {
      setError(null);
      if (camera) {
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
          base64: true,
        });
      }

      if (!result.canceled) {
        setIsAnalyzing(true);
        try {
          const response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: {
                inlineData: {
                  data: result.assets[0].base64,
                  mimeType: "image/jpeg",
                },
              },
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Analysis failed");
          }

          if (!data.data?.foodAnalysis) {
            throw new Error(
              "This doesn't look like food. Please try with a food image."
            );
          }

          const foodAnalysis = data.data.foodAnalysis;
          foodAnalysis.image = result.assets[0].uri;
          setAnalysis(foodAnalysis);
          router.push("/result");
        } catch (error) {
          console.error(error);
          setError(
            error.message || "Failed to analyze the image. Please try again."
          );
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
          setIsAnalyzing(false);
        }
      }
    } catch (error) {
      console.error(error);
      setError(error.message || "Something went wrong. Please try again.");
      setIsAnalyzing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <LinearGradient
      colors={["#000000", "#0A1A2F"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {isAnalyzing ? (
        <Animated.View style={[styles.card2, animatedBg]}>
          <LottieView
            source={require("@/assets/lotties/loader.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
        </Animated.View>
      ) : error ? (
        <Animated.View style={[styles.card, animatedBg]}>
          <LottieView
            source={require("@/assets/lotties/loader.json")}
            autoPlay
            style={styles.errorLottie}
          />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>
            Try uploading a meal, dessert, or snack. We'll analyze it right
            away!
          </Text>

          <Animated.View style={[styles.buttonWrapper, animatedButton1Style]}>
            <Pressable
              style={[styles.button, styles.retryButton]}
              onPressIn={() => handlePressIn(button1Scale)}
              onPressOut={() => handlePressOut(button1Scale)}
              onPress={resetError}
            >
              <Ionicons
                name="refresh"
                size={24}
                color="#00f2fe"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.card, animatedBg]}>
          <Text style={styles.title}>Analyze F🍊🥞d</Text>
          <Text style={styles.subtitle}>
            Analyze food in seconds. Just snap or upload!
          </Text>

          <Animated.View style={[styles.buttonWrapper, animatedButton1Style]}>
            <Pressable
              style={[styles.button, styles.cameraButton]}
              onPressIn={() => handlePressIn(button1Scale)}
              onPressOut={() => handlePressOut(button1Scale)}
              onPress={() => captureImage(true)}
            >
              <Ionicons
                name="camera-outline"
                size={24}
                color="#00f2fe"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Take Photo</Text>
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.buttonWrapper, animatedButton2Style]}>
            <Pressable
              style={[styles.button, styles.galleryButton]}
              onPressIn={() => handlePressIn(button2Scale)}
              onPressOut={() => handlePressOut(button2Scale)}
              onPress={() => captureImage(false)}
            >
              <Ionicons
                name="images"
                size={24}
                color="#4facfe"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Pick from Gallery</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "97%",
    padding: 30,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    height: "97%",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 10 },
  },
  card2: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.03)",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(0, 242, 254, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "400",
  },
  buttonWrapper: {
    marginBottom: 16,
  },
  button: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 2,
  },
  cameraButton: {
    backgroundColor: "rgba(0, 242, 254, 0.1)",
    borderColor: "rgba(0, 242, 254, 0.3)",
    shadowColor: "#00f2fe",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  galleryButton: {
    backgroundColor: "rgba(79, 172, 254, 0.1)",
    borderColor: "rgba(79, 172, 254, 0.3)",
    shadowColor: "#4facfe",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  retryButton: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderColor: "rgba(255, 59, 48, 0.3)",
    shadowColor: "#ff3b30",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  icon: {
    marginRight: 10,
  },
  lottie: {
    width: "100%",
    height: "100%",
  },
  errorLottie: {
    width: 200,
    height: 200,
    alignSelf: "center",
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ff3b30",
    textAlign: "center",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
});
