import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  exp: number;
  iat: number;
  userId: string;
  email: string;
  role: string;
}

/**
 * JWT token'ın expire olup olmadığını kontrol eder
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;

    // Token'ın süresinin bitiminden 5 dakika önce expired sayalım (güvenlik için)
    const bufferTime = 5 * 60; // 5 minutes in seconds

    return decoded.exp < currentTime + bufferTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Decode edilemeyen token expired sayılır
  }
};

/**
 * Token'dan user bilgilerini çıkarır
 */
export const getUserFromToken = (token: string) => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Error extracting user from token:", error);
    return null;
  }
};

/**
 * Token'ın kalan süresini dakika cinsinden döndürür
 */
export const getTokenTimeRemaining = (token: string): number => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;
    const remainingSeconds = decoded.exp - currentTime;
    return Math.max(0, Math.floor(remainingSeconds / 60));
  } catch (error) {
    console.error("Error calculating token time remaining:", error);
    return 0;
  }
};
