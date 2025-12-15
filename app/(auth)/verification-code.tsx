import React, { useState, useRef } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function VerificationCodeScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all fields are filled, navigate to reset password
    if (newCode.every(digit => digit !== "") && newCode.join("").length === 6) {
      router.push({
        pathname: "/(auth)/reset-password",
        params: { email, otp: newCode.join("") },
      });
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (timeLeft === 0) {
      setTimeLeft(30);
      // Trigger resend OTP logic here
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.container}
        className="bg-gray-50"
      >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </Pressable>
        </View>

        {/* Title */}
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.description}>We sent a code to {email || "your email"}</Text>

        {/* Code Inputs */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                digit && styles.codeInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleCodeChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <Pressable onPress={handleResend} disabled={timeLeft > 0}>
            <Text
              style={[
                styles.resendLink,
                timeLeft > 0 && styles.resendLinkDisabled,
              ]}
            >
              Resend code
            </Text>
          </Pressable>
          {timeLeft > 0 && (
            <Text style={styles.timer}>(0:{timeLeft.toString().padStart(2, "0")})</Text>
          )}
        </View>

        {/* Verify Button */}
        <Pressable
          style={[
            styles.verifyButton,
            code.every(digit => digit !== "") && styles.verifyButtonActive,
          ]}
          onPress={() => {
            if (code.every(digit => digit !== "")) {
              router.push({
                pathname: "/(auth)/reset-password",
                params: { email, otp: code.join("") },
              });
            }
          }}
          disabled={!code.every(digit => digit !== "")}
        >
          <Text
            style={[
              styles.verifyButtonText,
              code.every(digit => digit !== "") && styles.verifyButtonTextActive,
            ]}
          >
            Verify
          </Text>
        </Pressable>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 40,
    textAlign: "center",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 12,
  },
  codeInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    backgroundColor: "#FFFFFF",
  },
  codeInputFilled: {
    borderColor: "#3B82F6",
    borderWidth: 2,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    flexWrap: "wrap",
  },
  resendText: {
    fontSize: 14,
    color: "#6B7280",
  },
  resendLink: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "600",
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
  timer: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  verifyButton: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  verifyButtonActive: {
    backgroundColor: "#3B82F6",
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  verifyButtonTextActive: {
    color: "#FFFFFF",
  },
});

