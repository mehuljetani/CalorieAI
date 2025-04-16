import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { useAtomValue } from "jotai";
import { analysisAtom } from "@/atoms/analysis";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSpring,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CollapsibleSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    rotation.value = withSpring(isCollapsed ? 180 : 0);
    height.value = withTiming(isCollapsed ? 1 : 0, { duration: 300 });
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: height.value,
    height: height.value === 0 ? 0 : undefined,
  }));

  return (
    <Animated.View
      style={[styles.section, { overflow: "hidden" }]}
      entering={FadeIn.duration(500)}
    >
      <AnimatedPressable
        onPress={toggleCollapse}
        style={styles.sectionHeader}
        android_ripple={{ color: "rgba(255,255,255,0.1)" }}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Animated.View style={iconStyle}>
          <Ionicons name="chevron-down" size={20} color="#00f2fe" />
        </Animated.View>
      </AnimatedPressable>

      <Animated.View style={contentStyle}>{children}</Animated.View>
    </Animated.View>
  );
};

const NutritionItem = ({ label, value }: { label: string; value: string }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.nutritionItem, animatedStyle]}
      onPressIn={() => (scale.value = withSpring(0.95))}
      onPressOut={() => (scale.value = withSpring(1))}
    >
      <View style={styles.nutritionItemInner}>
        <Text style={styles.nutritionLabel}>{label}</Text>
        <Text style={styles.nutritionValue}>{value}</Text>
      </View>
    </AnimatedPressable>
  );
};

const Page = () => {
  const analysis = useAtomValue(analysisAtom);
  const imageOpacity = useSharedValue(0);

  if (!analysis) return null;

  const imageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  return (
    <LinearGradient colors={["#121212", "#000000"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[styles.imageContainer, imageStyle]}
          onLayout={() => {
            imageOpacity.value = withTiming(1, { duration: 800 });
          }}
        >
          <Image
            source={{ uri: analysis.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.imageOverlay}
          />
        </Animated.View>

        <View style={styles.titleContainer}>
          <Text style={styles.foodName}>{analysis.identifiedFood}</Text>
          <View style={styles.divider} />
        </View>

        <CollapsibleSection title="Portion Information">
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Portion Size:</Text>
              <Text style={styles.value}>{analysis.portionSize}g</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Serving Size:</Text>
              <Text style={styles.value}>
                {analysis.recognizedServingSize}g
              </Text>
            </View>
          </View>
        </CollapsibleSection>

        <CollapsibleSection title="Nutrition Facts">
          <View style={styles.sectionContent}>
            <View style={styles.nutritionGrid}>
              <NutritionItem
                label="Calories"
                value={analysis.nutritionFactsPerPortion.calories}
              />
              <NutritionItem
                label="Protein"
                value={`${analysis.nutritionFactsPerPortion.protein}g`}
              />
              <NutritionItem
                label="Carbs"
                value={`${analysis.nutritionFactsPerPortion.carbs}g`}
              />
              <NutritionItem
                label="Fat"
                value={`${analysis.nutritionFactsPerPortion.fat}g`}
              />
              <NutritionItem
                label="Fiber"
                value={`${analysis.nutritionFactsPerPortion.fiber}g`}
              />
              <NutritionItem
                label="Sugar"
                value={`${analysis.nutritionFactsPerPortion.sugar}g`}
              />
              <NutritionItem
                label="Sodium"
                value={`${analysis.nutritionFactsPerPortion.sodium}mg`}
              />
              <NutritionItem
                label="Cholesterol"
                value={`${analysis.nutritionFactsPerPortion.cholesterol}mg`}
              />
            </View>
          </View>
        </CollapsibleSection>

        <CollapsibleSection title="Additional Notes">
          <View style={styles.sectionContent}>
            {analysis.additionalNotes.map((note, index) => (
              <Animated.Text
                key={index}
                style={styles.note}
                entering={FadeIn.delay(index * 100)}
              >
                • {note}
              </Animated.Text>
            ))}
          </View>
        </CollapsibleSection>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  imageContainer: {
    height: 300,
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "40%",
  },
  titleContainer: {
    padding: 24,
    paddingBottom: 16,
  },
  foodName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  divider: {
    height: 2,
    backgroundColor: "rgba(0, 242, 254, 0.3)",
    marginTop: 16,
    width: "30%",
    alignSelf: "center",
  },
  section: {
    backgroundColor: "rgba(30, 30, 30, 0.6)",
    marginTop: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  label: {
    fontSize: 16,
    color: "#aaa",
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  nutritionItem: {
    width: "50%",
    padding: 8,
  },
  nutritionItemInner: {
    backgroundColor: "rgba(0, 242, 254, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 242, 254, 0.2)",
  },
  nutritionLabel: {
    fontSize: 14,
    color: "#00f2fe",
    marginBottom: 4,
    fontWeight: "500",
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  note: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 12,
    lineHeight: 24,
  },
});

export default Page;
