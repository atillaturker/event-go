#!/bin/bash

# EventGO API Test Script

BASE_URL="http://localhost:5000/api/auth"

echo "🚀 EventGO API Test Script"
echo "=========================="

# 1. Register Test
echo "📝 Testing Register..."
curl -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123", 
    "role": "USER"
  }' | jq .

echo -e "\n"

# 2. Login Test
echo "🔐 Testing Login..."
RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo $RESPONSE | jq .

# Extract token
TOKEN=$(echo $RESPONSE | jq -r '.token')

echo -e "\n"

# 3. Profile Test
echo "👤 Testing Profile..."
curl -X GET "$BASE_URL/profile" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n✅ Tests completed!"
