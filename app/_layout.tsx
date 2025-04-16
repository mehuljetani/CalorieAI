import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function RootLayout() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#121212", "#000000"]} style={styles.background}>
      <Stack
        screenOptions={{
          statusBarHidden: true,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "",
            headerTitleAlign: "center",
            headerTransparent: true,
          }}
        />
        <Stack.Screen
          name="result"
          options={{
            presentation: "modal",
            title: "",
            headerTitleAlign: "center",

            headerLeft: () => (
              <AnimatedTouchable
                onPress={() => router.dismiss()}
                style={styles.closeButton}
                entering={FadeIn.delay(100)}
                exiting={FadeOut}
              >
                <Ionicons name="close" size={22} color="#fff" />
              </AnimatedTouchable>
            ),
            headerRight: () => (
              <View style={{ width: 24 }} /> // Balance the header
            ),
            headerTransparent: true,
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  closeButton: {
    // padding: 6,
    borderRadius: 6,
    backgroundColor: "rgba(79, 172, 254, 0.3)",
    borderWidth: 3,
    borderColor: "#fff",
  },
});
