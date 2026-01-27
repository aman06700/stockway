#!/bin/bash

# Authentication Migration Verification Script
# This script verifies that the OTP-based authentication has been successfully
# migrated to email/password authentication

echo "=========================================="
echo "Authentication Migration Verification"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Verify new authentication endpoints exist
echo "1. Checking Backend Authentication Endpoints..."
if grep -q "SignUpView" accounts/views.py && grep -q "SignInView" accounts/views.py; then
    echo -e "${GREEN}✓${NC} SignUpView and SignInView found"
else
    echo -e "${RED}✗${NC} SignUpView or SignInView not found"
fi

# Check 2: Verify OTP code is removed
echo ""
echo "2. Checking for OTP code removal..."
OTP_COUNT=$(grep -r "send_otp\|verify_otp\|SendOTP\|VerifyOTP" --include="*.py" accounts/views.py accounts/serializers.py core/services.py 2>/dev/null | wc -l)
if [ "$OTP_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No OTP references in backend code"
else
    echo -e "${RED}✗${NC} Found $OTP_COUNT OTP references in backend"
fi

# Check 3: Verify new serializers
echo ""
echo "3. Checking Backend Serializers..."
if grep -q "SignUpSerializer" accounts/serializers.py && grep -q "SignInSerializer" accounts/serializers.py; then
    echo -e "${GREEN}✓${NC} SignUpSerializer and SignInSerializer found"
else
    echo -e "${RED}✗${NC} New serializers not found"
fi

# Check 4: Verify URL patterns
echo ""
echo "4. Checking URL Patterns..."
if grep -q "signup/" accounts/urls.py && grep -q "signin/" accounts/urls.py; then
    echo -e "${GREEN}✓${NC} New authentication URLs configured"
else
    echo -e "${RED}✗${NC} New URLs not configured"
fi

# Check 5: Verify PENDING role exists
echo ""
echo "5. Checking User Model..."
if grep -q "PENDING" accounts/models.py; then
    echo -e "${GREEN}✓${NC} PENDING role added to User model"
else
    echo -e "${RED}✗${NC} PENDING role not found in User model"
fi

# Check 6: Check frontend authentication service
echo ""
echo "6. Checking Frontend Authentication..."
if [ -f "frontend/src/services/authService.ts" ]; then
    if grep -q "signUp" frontend/src/services/authService.ts && grep -q "signIn" frontend/src/services/authService.ts; then
        echo -e "${GREEN}✓${NC} Frontend signUp and signIn methods found"
    else
        echo -e "${RED}✗${NC} Frontend methods not updated"
    fi
else
    echo -e "${YELLOW}⚠${NC} Frontend service file not found"
fi

# Check 7: Verify SignUpPage exists
echo ""
echo "7. Checking Frontend Pages..."
if [ -f "frontend/src/pages/auth/SignUpPage.tsx" ]; then
    echo -e "${GREEN}✓${NC} SignUpPage created"
else
    echo -e "${RED}✗${NC} SignUpPage not found"
fi

# Check 8: Verify OTPVerificationPage is removed
if [ ! -f "frontend/src/pages/auth/OTPVerificationPage.tsx" ]; then
    echo -e "${GREEN}✓${NC} OTPVerificationPage removed"
else
    echo -e "${YELLOW}⚠${NC} OTPVerificationPage still exists"
fi

# Check 9: Verify tests are updated
echo ""
echo "8. Checking Tests..."
if grep -q "SignUpViewTests" accounts/tests.py && grep -q "SignInViewTests" accounts/tests.py; then
    echo -e "${GREEN}✓${NC} New authentication tests found"
else
    echo -e "${RED}✗${NC} Tests not updated"
fi

# Check 10: Verify API documentation
echo ""
echo "9. Checking Documentation..."
if grep -q "Sign Up" accounts/API.md && grep -q "Sign In" accounts/API.md; then
    echo -e "${GREEN}✓${NC} API documentation updated"
else
    echo -e "${YELLOW}⚠${NC} API documentation may need updating"
fi

# Summary
echo ""
echo "=========================================="
echo "Verification Complete"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Run: python manage.py migrate"
echo "2. Configure Supabase for email/password authentication"
echo "3. Test user registration and login flows"
echo "4. Assign roles to PENDING users via admin interface"
echo ""
