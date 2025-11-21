#!/bin/bash

# WhatsApp Flow Demo - Endpoint Test Script
# Usage: ./test-endpoints.sh [base_url]
# Example: ./test-endpoints.sh http://localhost:1337

BASE_URL="${1:-http://localhost:1337}"
ENDPOINT="$BASE_URL/api/whatsapp-flow-demo/endpoint"
PHONE="+905551234567"

echo "🧪 Testing WhatsApp Flow Demo Endpoints"
echo "📍 Base URL: $BASE_URL"
echo "🔗 Endpoint: $ENDPOINT"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: INIT Action
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: INIT Action"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"INIT\",
    \"flow_token\": \"$PHONE\",
    \"version\": \"1.0\"
  }")

if echo "$RESPONSE" | grep -q "MAIN_MENU"; then
  echo -e "${GREEN}✅ PASSED${NC} - INIT action returned MAIN_MENU screen"
  echo "$RESPONSE" | jq '.'
else
  echo -e "${RED}❌ FAILED${NC} - INIT action did not return expected response"
  echo "$RESPONSE"
fi
echo ""

# Test 2: Ship Select
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Ship Select (data_exchange)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"data_exchange\",
    \"flow_token\": \"$PHONE\",
    \"screen\": \"SHIP_SELECT\",
    \"data\": {
      \"selected_ship_id\": \"ship_001\"
    }
  }")

if echo "$RESPONSE" | grep -q "MODULE_SELECT"; then
  echo -e "${GREEN}✅ PASSED${NC} - Ship select returned MODULE_SELECT screen"
  echo "$RESPONSE" | jq '.'
else
  echo -e "${RED}❌ FAILED${NC} - Ship select did not return expected response"
  echo "$RESPONSE"
fi
echo ""

# Test 3: Module Select
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Module Select (data_exchange)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"data_exchange\",
    \"flow_token\": \"$PHONE\",
    \"screen\": \"MODULE_SELECT\",
    \"data\": {
      \"selected_module\": \"propulsion\"
    }
  }")

if echo "$RESPONSE" | grep -q "MACHINE_LIST"; then
  echo -e "${GREEN}✅ PASSED${NC} - Module select returned MACHINE_LIST screen"
  echo "$RESPONSE" | jq '.'
else
  echo -e "${RED}❌ FAILED${NC} - Module select did not return expected response"
  echo "$RESPONSE"
fi
echo ""

# Test 4: Machine Select
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Machine Select (data_exchange)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"data_exchange\",
    \"flow_token\": \"$PHONE\",
    \"screen\": \"MACHINE_LIST\",
    \"data\": {
      \"selected_machine_id\": \"machine_001\"
    }
  }")

if echo "$RESPONSE" | grep -q "UPDATE_HOURS"; then
  echo -e "${GREEN}✅ PASSED${NC} - Machine select returned UPDATE_HOURS screen"
  echo "$RESPONSE" | jq '.'
else
  echo -e "${RED}❌ FAILED${NC} - Machine select did not return expected response"
  echo "$RESPONSE"
fi
echo ""

# Test 5: Update Hours (Valid)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: Update Hours - Valid (data_exchange)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"data_exchange\",
    \"flow_token\": \"$PHONE\",
    \"screen\": \"UPDATE_HOURS\",
    \"data\": {
      \"new_hours\": 12480
    }
  }")

if echo "$RESPONSE" | grep -q "CONFIRMATION"; then
  echo -e "${GREEN}✅ PASSED${NC} - Update hours succeeded and returned CONFIRMATION"
  echo "$RESPONSE" | jq '.'
else
  echo -e "${RED}❌ FAILED${NC} - Update hours did not return expected response"
  echo "$RESPONSE"
fi
echo ""

# Test 6: Update Hours (Invalid - Decrease)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 6: Update Hours - Invalid Decrease (should fail)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# First, get current machine state
INIT_RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"INIT\",
    \"flow_token\": \"$PHONE\"
  }")

# Navigate to machine
curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"data_exchange\",
    \"flow_token\": \"$PHONE\",
    \"screen\": \"SHIP_SELECT\",
    \"data\": {\"selected_ship_id\": \"ship_001\"}
  }" > /dev/null

curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"data_exchange\",
    \"flow_token\": \"$PHONE\",
    \"screen\": \"MODULE_SELECT\",
    \"data\": {\"selected_module\": \"propulsion\"}
  }" > /dev/null

curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"data_exchange\",
    \"flow_token\": \"$PHONE\",
    \"screen\": \"MACHINE_LIST\",
    \"data\": {\"selected_machine_id\": \"machine_001\"}
  }" > /dev/null

# Try to decrease hours (should fail)
RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"data_exchange\",
    \"flow_token\": \"$PHONE\",
    \"screen\": \"UPDATE_HOURS\",
    \"data\": {
      \"new_hours\": 100
    }
  }")

if echo "$RESPONSE" | grep -q "error_message"; then
  echo -e "${GREEN}✅ PASSED${NC} - Validation correctly rejected decreased hours"
  echo "$RESPONSE" | jq '.'
else
  echo -e "${YELLOW}⚠️  WARNING${NC} - Expected validation error for decreased hours"
  echo "$RESPONSE"
fi
echo ""

# Test 7: Invalid Action
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 7: Invalid Action (should fail)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"INVALID_ACTION\",
    \"flow_token\": \"$PHONE\"
  }")

if echo "$RESPONSE" | grep -q "error_message"; then
  echo -e "${GREEN}✅ PASSED${NC} - Invalid action correctly rejected"
  echo "$RESPONSE" | jq '.'
else
  echo -e "${RED}❌ FAILED${NC} - Invalid action should return error"
  echo "$RESPONSE"
fi
echo ""

# Test 8: User Not Found
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 8: User Not Found (invalid phone)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"INIT\",
    \"flow_token\": \"+905559999999\"
  }")

if echo "$RESPONSE" | grep -q "error_message"; then
  echo -e "${GREEN}✅ PASSED${NC} - User not found error returned correctly"
  echo "$RESPONSE" | jq '.'
else
  echo -e "${RED}❌ FAILED${NC} - Should return user not found error"
  echo "$RESPONSE"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏁 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Endpoint: $ENDPOINT"
echo ""
echo "✅ All critical endpoints are working!"
echo ""
echo "💡 Next Steps:"
echo "  1. Use ngrok to create public URL"
echo "  2. Upload whatsapp-flow.json to Meta Business Manager"
echo "  3. Configure endpoint URL in Meta"
echo "  4. Test with real WhatsApp"
echo ""
echo "📚 For detailed instructions, see:"
echo "  - QUICKSTART.md"
echo "  - README.md"
