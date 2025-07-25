import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "jwt_token";

export const saveToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
    if (savedToken === token) {
      console.log("✅ Token successfully saved to secure storage");
    } else {
      console.error("❌ Token saving failed - tokens don't match");
    }
  } catch (error) {
    console.error("❌ Error saving token:", error);
  }
};

export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

export const deleteToken = async () => {
  try {
    console.log("🗑️ Attempting to delete token from secure storage...");
    await SecureStore.deleteItemAsync(TOKEN_KEY);

    // Silme işlemini doğrula
    const checkToken = await SecureStore.getItemAsync(TOKEN_KEY);
    if (checkToken === null) {
      console.log("✅ Token successfully deleted from secure storage");
    } else {
      console.error(
        "❌ Token deletion failed - token still exists:",
        checkToken
      );
    }
  } catch (error) {
    console.error("❌ Error deleting token:", error);
  }
};
