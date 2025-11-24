import { GlassContainer, GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { StatusBar } from "expo-status-bar";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
const Background = require("@/assets/images/DSC5762.jpg");

// ドラッグ可能なGlassViewコンポーネント（元の位置に戻る）
function DraggableGlassView({
  initialX,
  initialY,
  style
}: {
  initialX: number;
  initialY: number;
  style: any;
}) {
  // 現在の位置（元の位置からの相対位置）
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // ドラッグ開始時の位置
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => {
      // ドラッグ開始時の現在位置を保存
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      // ドラッグ中は移動量を反映
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      // 手を離したら元の位置（0, 0）にスプリングアニメーションで戻る
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left: initialX, top: initialY }]}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[animatedStyle]}>
          <GlassView style={style} isInteractive />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

export default function GlassEffectScreen() {
  const glassAvailable = isLiquidGlassAvailable();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
      {/* 背景画像 */}
      <Image source={Background} style={styles.image} />

      {/* 単一のGlassView - clear style */}
      <GlassView style={styles.glassView1} glassEffectStyle="clear">
        <Text style={styles.glassText}>Clear Glass</Text>
      </GlassView>

      {/* 単一のGlassView - regular style */}
      <GlassView style={styles.glassView2} glassEffectStyle="regular">
        <Text style={styles.glassText}>Regular Glass</Text>
      </GlassView>

      {/* ドラッグ可能なGlassViewコンテナ */}
      <GlassContainer spacing={10} style={styles.glassContainer}>
        <DraggableGlassView initialX={0} initialY={0} style={styles.glass1} />
        <DraggableGlassView initialX={90} initialY={0} style={styles.glass2} />
        <DraggableGlassView initialX={160} initialY={0} style={styles.glass3} />
      </GlassContainer>

      {/* Liquid Glass availability indicator */}
      <GlassView style={styles.statusView} glassEffectStyle="regular">
        <Text style={styles.statusText}>
          Liquid Glass: {glassAvailable ? "Available ✓" : "Not Available ✗"}
        </Text>
      </GlassView>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    objectFit: "cover",
  },
  glassView1: {
    position: "absolute",
    top: 100,
    left: 50,
    width: 250,
    height: 120,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  glassView2: {
    position: "absolute",
    top: 250,
    left: 50,
    width: 250,
    height: 120,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  glassText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
  glassContainer: {
    position: "absolute",
    top: 400,
    left: 50,
    width: 300,
    height: 150,
  },
  glass1: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  glass2: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  glass3: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statusView: {
    position: "absolute",
    bottom: 100,
    left: 50,
    right: 50,
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});
