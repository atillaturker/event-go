import React from "react";
import { FlatList, Image, View } from "react-native";
import CustomText from "./CustomText";

const EventsFlatList = ({ data }) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      decelerationRate={"normal"}
      bounces={false}
      overScrollMode="never"
      renderItem={({ item }) => (
        <View
          style={{
            flexDirection: "column",
            alignItems: "flex-start",
            width: 220,
          }}
        >
          <Image
            source={item.image}
            style={{
              width: 180,
              height: 195,
              borderRadius: 8,
            }}
          />
          <View style={{ width: "100%" }}>
            <CustomText
              fontFamily="PlusJakartaSans"
              fontWeight="600"
              style={{
                fontSize: 20,
                color: "#1F2937",
                marginTop: 10,
                textAlign: "left",
              }}
            >
              {item.title}
            </CustomText>
            <CustomText
              fontFamily="Inter"
              fontWeight="400"
              style={{
                fontSize: 16,
                color: "#6B7280",
                textAlign: "left",
                marginTop: 5,
              }}
            >
              {item.text}
            </CustomText>
          </View>
        </View>
      )}
    />
  );
};

export default EventsFlatList;
