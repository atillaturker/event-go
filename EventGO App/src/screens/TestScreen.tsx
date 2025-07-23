import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const FixedHeaderApp = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Sabit Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Uygulama Adı</Text>
        <View style={styles.headerActions}>
          <Text style={styles.actionButton}>Geri</Text>
          <Text style={styles.actionButton}>Ayarlar</Text>
        </View>
      </View>

      {/* Kaydırılabilir İçerik */}
      <ScrollView style={styles.content}>
        {[...Array(50)].map((_, i) => (
          <View key={i} style={styles.item}>
            <Text style={styles.itemText}>İçerik Öğesi {i + 1}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 60,
    backgroundColor: "#6200ee",
    paddingHorizontal: 16,
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,

    zIndex: 10, // Header'ın içerik üzerinde kalmasını sağlar
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerActions: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    color: "white",
    marginLeft: 15,
    fontSize: 16,
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: {
    fontSize: 16,
  },
});

export default FixedHeaderApp;
