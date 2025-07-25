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
import { useLoginMutation } from "../services/authApi";
import { setCredentials } from "../store/authSlice";
import { loginSchema, type LoginFormData } from "../types/auth";
import type { RootStackParamList } from "../types/navigation";
import { saveToken } from "../utils/secureStorage";

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      const result = await login(data).unwrap();
      console.log("Data", JSON.stringify(result));
      dispatch(
        setCredentials({
          user: result.data.user,
          token: result.data.token,
        })
      );

      await saveToken(result.data.token);

      Alert.alert("Success", "Login successful!");
    } catch (err: any) {
      Alert.alert("Login Failed", err.data?.error || "Invalid credentials");
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "Password reset functionality will be implemented soon."
    );
  };

  const handleSignUp = () => {
    navigation.navigate("RegisterScreen");
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <CustomText fontWeight="600" style={styles.headerTitle}>
            Login
          </CustomText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <CustomText fontWeight="700" style={styles.welcomeText}>
            Welcome back
          </CustomText>
          <CustomText
            fontFamily="Inter"
            fontWeight="400"
            style={styles.subText}
          >
            Please enter your credentials to continue
          </CustomText>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <CustomText fontWeight="200" style={styles.errorText}>
                {errors.email && errors.email.message}
              </CustomText>
              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#A0A0A0"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    autoCorrect={false}
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
                    placeholder="Password"
                    placeholderTextColor="#A0A0A0"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                )}
                name="password"
              />
            </View>

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordContainer}
            >
              <CustomText style={styles.forgotPasswordText}>
                Forgot Password?
              </CustomText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleSubmit(handleLogin)}
            disabled={isLoading}
          >
            <CustomText fontWeight="800" style={styles.loginButtonText}>
              {isLoading ? "Logging in..." : "Login"}
            </CustomText>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <CustomText style={styles.signUpText}>
              Don't have an account?{" "}
            </CustomText>
            <TouchableOpacity onPress={handleSignUp}>
              <CustomText style={styles.signUpLink}>Sign up</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

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
  errorText: {
    fontSize: 12,
    color: "#FF0000",
    marginBottom: 5,
    marginLeft: 5,
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
  welcomeText: {
    fontSize: 32,
    color: "#000000",
    marginBottom: 20,
    marginTop: 25,
  },
  subText: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 5,
  },
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
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
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: 10,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#38E078",
  },
  loginButton: {
    backgroundColor: "#38E078",
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 30,
  },
  loginButtonDisabled: {
    backgroundColor: "#A5C973",
  },
  loginButtonText: {
    fontSize: 16,
    color: "#0D1A12",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 14,
    color: "#666666",
  },
  signUpLink: {
    fontSize: 14,
    color: "#38E078",
  },
});
