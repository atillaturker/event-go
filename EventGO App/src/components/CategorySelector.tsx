import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
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
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1, word.length).toLowerCase()
      )
      .join(" ");
  };

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="Select Category"
      maxHeight={800}
    >
      <ScrollView style={styles.container}>
        {Object.values(EventCategory).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryOption,
              selectedCategory === category && styles.categoryOptionSelected,
            ]}
            onPress={() => handleCategorySelect(category)}
          >
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
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  categoryOptionText: {
    fontSize: 16,
    color: "#000",
  },
  categoryOptionTextSelected: {
    color: "#6366f1",
  },
});

export default CategorySelector;
