import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { EventCategory } from "../types/events";
import BottomSheetModal from "./BottomSheetModal";
import CustomText from "./CustomText";

interface CategorySelectorProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: string;
  onCategorySelect: (category: EventCategory) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  visible,
  onClose,
  selectedCategory,
  onCategorySelect,
}) => {
  const handleCategorySelect = (category: EventCategory) => {
    onCategorySelect(category);
    onClose();
  };

  const categoryDisplayName = (category: EventCategory): string => {
    return category
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getCategoryIcon = (
    category: EventCategory
  ): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case EventCategory.CONCERT:
        return "musical-notes";
      case EventCategory.SPORTS:
        return "football";
      case EventCategory.PERFORMING_ARTS:
        return "mic";
      case EventCategory.TECHNOLOGY:
        return "laptop";
      case EventCategory.EDUCATION:
        return "school";
      case EventCategory.FOOD_DRINK:
        return "restaurant";
      case EventCategory.ART:
        return "brush";
      case EventCategory.OTHER:
        return "ellipsis-horizontal";
      default:
        return "ellipsis-horizontal";
    }
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="Select Category"
      maxHeight={700}
    >
      <View style={styles.container}>
        {Object.values(EventCategory).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryOption,
              selectedCategory === category && styles.categoryOptionSelected,
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            <View style={styles.categoryContent}>
              <View style={styles.categoryLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    selectedCategory === category &&
                      styles.iconContainerSelected,
                  ]}
                >
                  <Ionicons
                    name={getCategoryIcon(category)}
                    size={20}
                    color={selectedCategory === category ? "#6366f1" : "#666"}
                  />
                </View>
                <CustomText
                  fontWeight="500"
                  style={[
                    styles.categoryOptionText,
                    selectedCategory === category &&
                      styles.categoryOptionTextSelected,
                  ]}
                >
                  {categoryDisplayName(category)}
                </CustomText>
              </View>

              {selectedCategory === category && (
                <Ionicons name="checkmark-circle" size={20} color="#6366f1" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  categoryOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginHorizontal: -16,
  },
  categoryOptionSelected: {
    backgroundColor: "#f0f4ff",
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconContainerSelected: {
    backgroundColor: "#e8eaff",
  },
  categoryOptionText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  categoryOptionTextSelected: {
    color: "#6366f1",
  },
});

export default CategorySelector;
