import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import CustomText from "../components/CustomText";
import { useRegisterMutation } from "../services/authApi";
import { setCredentials } from "../store/authSlice";
import { registerSchema, type RegisterFormData } from "../types/auth";
import type { RootStackParamList } from "../types/navigation";
import { saveToken } from "../utils/secureStorage";

type RegisterScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Register"
>;

const RegisterScreen = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const dispatch = useDispatch();

  // RTK Query mutation hook
  const [register, { isLoading }] = useRegisterMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleRegister = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;

      // Convert username to name for the API request
      const requestData = {
        ...registerData,
        name: registerData.username,
        role: "USER",
      };

      const result = await register(requestData).unwrap();

      dispatch(
        setCredentials({
          token: result.data.token,
          user: result.data.user,
        })
      );

      saveToken(result.data.token);

      Alert.alert("Success", "Account created successfully!");
    } catch (err: any) {
      const errorMessage =
        err?.data?.error || err?.message || "Failed to create account";

      Alert.alert("Registration Failed", errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <CustomText fontWeight="600" style={styles.headerTitle}>
            Create Account
          </CustomText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <CustomText
            fontFamily="Inter"
            fontWeight="400"
            style={styles.subtitle}
          >
            Welcome to EventGO! Create your account and discover events.
          </CustomText>

          <View style={styles.form}>
            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <CustomText fontWeight="200" style={styles.errorText}>
                {errors.username && errors.username.message}
              </CustomText>
              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your username"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                  />
                )}
                name="username"
              />
            </View>

            <View style={styles.inputContainer}>
              <CustomText fontWeight="200" style={styles.errorText}>
                {errors.email && errors.email.message}
              </CustomText>
              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
                name="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <CustomText fontWeight="200" style={styles.errorText}>
                {errors.password && errors.password.message}
              </CustomText>
              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                  />
                )}
                name="password"
              />
            </View>

            <View style={styles.inputContainer}>
              <CustomText fontWeight="200" style={styles.errorText}>
                {errors.confirmPassword && errors.confirmPassword.message}
              </CustomText>
              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                  />
                )}
                name="confirmPassword"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                isLoading && styles.registerButtonDisabled,
              ]}
              onPress={handleSubmit(handleRegister)}
              disabled={isLoading}
            >
              <CustomText fontWeight="800" style={styles.registerButtonText}>
                {isLoading ? "Creating Account..." : "Register"}
              </CustomText>
            </TouchableOpacity>

            <View style={styles.loginLinkContainer}>
              <CustomText style={styles.loginLinkText}>
                Already have an account?{" "}
              </CustomText>
              <TouchableOpacity
                onPress={() => navigation.navigate("LoginScreen")}
              >
                <CustomText style={styles.loginLinkBold}>Log In</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    color: "#000000",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 20,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 5,
  },
  errorText: {
    fontSize: 12,
    color: "#FF0000",
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: "#000000",
    fontFamily: "PlusJakartaSans_400Regular",
  },
  registerButton: {
    backgroundColor: "#38E078",
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  registerButtonDisabled: {
    backgroundColor: "#A5C973",
  },
  registerButtonText: {
    fontSize: 16,
    color: "#0D1A12",
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 14,
    color: "#666666",
  },
  loginLinkBold: {
    fontSize: 14,
    color: "#38E078",
  },
});
