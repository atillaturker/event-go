import React from "react";
import { Text, TextProps } from "react-native";

interface CustomTextProps extends TextProps {
  fontFamily?: "PlusJakartaSans" | "Inter";
  fontWeight?:
    | "400"
    | "500"
    | "600"
    | "700"
    | "200"
    | "200-italic"
    | "300"
    | "300-italic"
    | "400-italic"
    | "500-italic"
    | "600-italic"
    | "700-italic"
    | "800"
    | "800-italic";
  children: React.ReactNode;
}

const CustomText: React.FC<CustomTextProps> = ({
  fontFamily = "PlusJakartaSans",
  fontWeight,
  style,
  children,
  ...props
}) => {
  const getFontFamily = () => {
    if (fontFamily === "PlusJakartaSans") {
      switch (fontWeight) {
        case "200":
          return "PlusJakartaSans_200ExtraLight";
        case "200-italic":
          return "PlusJakartaSans_200ExtraLight_Italic";
        case "300":
          return "PlusJakartaSans_300Light";
        case "300-italic":
          return "PlusJakartaSans_300Light_Italic";
        case "400":
          return "PlusJakartaSans_400Regular";
        case "400-italic":
          return "PlusJakartaSans_400Regular_Italic";
        case "500":
          return "PlusJakartaSans_500Medium";
        case "500-italic":
          return "PlusJakartaSans_500Medium_Italic";
        case "600":
          return "PlusJakartaSans_600SemiBold";
        case "600-italic":
          return "PlusJakartaSans_600SemiBold_Italic";
        case "700":
          return "PlusJakartaSans_700Bold";
        case "700-italic":
          return "PlusJakartaSans_700Bold_Italic";
        case "800":
          return "PlusJakartaSans_800ExtraBold";
        case "800-italic":
          return "PlusJakartaSans_800ExtraBold_Italic";
        default:
          return "PlusJakartaSans_400Regular";
      }
    } else {
      switch (fontWeight) {
        case "400":
          return "Inter_400Regular";
        case "500":
          return "Inter_500Medium";
        case "600":
          return "Inter_600SemiBold";
        default:
          return "Inter_400Regular";
      }
    }
  };

  return (
    <Text
      style={[
        {
          fontFamily: getFontFamily(),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default CustomText;
