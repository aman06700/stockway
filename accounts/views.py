from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from core.services import SupabaseService
from core.permissions import IsSuperAdmin
from accounts.serializers import (
    SignUpSerializer,
    SignInSerializer,
    UserSerializer,
    UserAdminSerializer,
    UserDeactivateSerializer,
    UserHardDeleteSerializer,
)
import logging


logger = logging.getLogger(__name__)

User = get_user_model()


class SignUpView(APIView):
    """
    Sign up new user with email and password
    """

    permission_classes = [AllowAny]

    def post(self, request):
        """
        Create new user account

        Request body:
        {
            "email": "user@example.com",
            "password": "secure_password",
            "confirm_password": "secure_password"
        }
        """
        serializer = SignUpSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        try:
            logger.info(f"Sign up request received for email: {email}")

            # Sign up user with Supabase
            supabase_response = SupabaseService.sign_up(email, password)

            # Access user data from response
            user_data = (
                supabase_response.user
                if hasattr(supabase_response, "user")
                else supabase_response.get("user")
            )
            session_data = (
                supabase_response.session
                if hasattr(supabase_response, "session")
                else supabase_response.get("session")
            )

            if not user_data:
                return Response(
                    {"error": "Sign up failed"}, status=status.HTTP_400_BAD_REQUEST
                )

            # Get or create Django user with default role
            user_id = user_data.id if hasattr(user_data, "id") else user_data.get("id")
            user, created = User.objects.get_or_create(
                supabase_uid=user_id,
                defaults={
                    "email": email,
                    "is_active": True,
                    "role": "PENDING",  # Default safe role, admin must assign proper role
                },
            )

            if created:
                logger.info(f"New user created during sign up: {email}")
            else:
                logger.debug(f"Existing user signed up: {email}")

            # Prepare response
            response_data = {
                "access_token": session_data.access_token
                if hasattr(session_data, "access_token")
                else session_data.get("access_token"),
                "refresh_token": session_data.refresh_token
                if hasattr(session_data, "refresh_token")
                else session_data.get("refresh_token"),
                "expires_in": session_data.expires_in
                if hasattr(session_data, "expires_in")
                else session_data.get("expires_in"),
                "expires_at": session_data.expires_at
                if hasattr(session_data, "expires_at")
                else session_data.get("expires_at"),
                "token_type": session_data.token_type
                if hasattr(session_data, "token_type")
                else session_data.get("token_type"),
                "user": UserSerializer(user).data,
            }

            logger.info(f"Sign up successful for user: {email}, user_id: {user.id}")
            return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Sign up failed: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SignInView(APIView):
    """
    Sign in user with email and password
    """

    permission_classes = [AllowAny]

    def post(self, request):
        """
        Authenticate user and return tokens

        Request body:
        {
            "email": "user@example.com",
            "password": "secure_password"
        }
        """
        serializer = SignInSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        try:
            logger.info(f"Attempting sign in for email: {email}")

            # Sign in with Supabase
            supabase_response = SupabaseService.sign_in(email, password)

            # Access user data from response
            user_data = (
                supabase_response.user
                if hasattr(supabase_response, "user")
                else supabase_response.get("user")
            )
            session_data = (
                supabase_response.session
                if hasattr(supabase_response, "session")
                else supabase_response.get("session")
            )

            if not user_data:
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            # Get or create Django user
            user_id = user_data.id if hasattr(user_data, "id") else user_data.get("id")
            user, created = User.objects.get_or_create(
                supabase_uid=user_id,
                defaults={
                    "email": email,
                    "is_active": True,
                    "role": "PENDING",  # Default safe role
                },
            )

            # Check if user is active
            if not user.is_active:
                logger.warning(f"Inactive user attempted sign in: {email}")
                return Response(
                    {"error": "Account is deactivated"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Check if user is soft deleted
            if user.is_deleted:
                logger.warning(f"Deleted user attempted sign in: {email}")
                return Response(
                    {"error": "Account has been deleted"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            if created:
                logger.info(f"New user created during sign in: {email}")
            else:
                logger.debug(f"Existing user authenticated: {email}")

            # Prepare response
            response_data = {
                "access_token": session_data.access_token
                if hasattr(session_data, "access_token")
                else session_data.get("access_token"),
                "refresh_token": session_data.refresh_token
                if hasattr(session_data, "refresh_token")
                else session_data.get("refresh_token"),
                "expires_in": session_data.expires_in
                if hasattr(session_data, "expires_in")
                else session_data.get("expires_in"),
                "expires_at": session_data.expires_at
                if hasattr(session_data, "expires_at")
                else session_data.get("expires_at"),
                "token_type": session_data.token_type
                if hasattr(session_data, "token_type")
                else session_data.get("token_type"),
                "user": UserSerializer(user).data,
            }

            logger.info(f"Sign in successful for user: {email}, user_id: {user.id}")
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Sign in failed: {str(e)}")
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    """
    Logout user by invalidating Supabase session
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Logout the authenticated user
        """
        try:
            # Get access token from request
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                access_token = auth_header.split(" ")[1]
                SupabaseService.sign_out(access_token)

            return Response(
                {"success": True, "message": "Logged out successfully"},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error(f"Logout failed: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CurrentUserView(APIView):
    """
    Get current authenticated user details
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get current user information
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ============================================================================
# Admin User Management Views
# ============================================================================


class AdminUserListView(APIView):
    """
    Admin endpoint to list all users including soft-deleted ones.
    """

    permission_classes = [IsSuperAdmin]

    def get(self, request):
        """
        List all users with optional filters.

        Query params:
        - include_deleted: bool - Include soft-deleted users (default: false)
        - role: str - Filter by role
        - is_active: bool - Filter by active status
        """
        include_deleted = (
            request.query_params.get("include_deleted", "false").lower() == "true"
        )
        role_filter = request.query_params.get("role", None)
        is_active_filter = request.query_params.get("is_active", None)

        if include_deleted:
            users = User.all_objects.all()
        else:
            users = User.objects.all()

        if role_filter:
            users = users.filter(role=role_filter.upper())

        if is_active_filter is not None:
            is_active = is_active_filter.lower() == "true"
            users = users.filter(is_active=is_active)

        serializer = UserAdminSerializer(users, many=True)
        return Response(
            {"count": users.count(), "users": serializer.data},
            status=status.HTTP_200_OK,
        )


class AdminUserDetailView(APIView):
    """
    Admin endpoint to get details of a specific user.
    """

    permission_classes = [IsSuperAdmin]

    def get(self, request, user_id):
        """
        Get detailed information about a specific user.
        Uses all_objects to include soft-deleted users.
        """
        try:
            user = User.all_objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Get dependency information
        has_deps, deps = user.has_dependent_data()

        serializer = UserAdminSerializer(user)
        response_data = serializer.data
        response_data["has_dependencies"] = has_deps
        response_data["dependencies"] = deps

        return Response(response_data, status=status.HTTP_200_OK)


class AdminUserDeactivateView(APIView):
    """
    Admin endpoint to deactivate (soft delete) a user.
    This marks the user as inactive and sets deleted_at timestamp.
    """

    permission_classes = [IsSuperAdmin]

    def post(self, request, user_id):
        """
        Soft delete a user (deactivate).

        Request body (optional):
        {
            "reason": "Optional reason for deactivation"
        }
        """
        serializer = UserDeactivateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.all_objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Prevent deactivating yourself
        if user.id == request.user.id:
            return Response(
                {"error": "You cannot deactivate your own account"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent deactivating superusers (unless you're also a superuser)
        if user.is_superuser and not request.user.is_superuser:
            return Response(
                {"error": "Only superusers can deactivate other superusers"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Check if already deleted
        if user.is_deleted:
            return Response(
                {"error": "User is already deactivated"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Perform soft delete
        reason = serializer.validated_data.get("reason", "")
        user.soft_delete()

        logger.info(
            f"User {user_id} soft-deleted by admin {request.user.id}. Reason: {reason or 'No reason provided'}"
        )

        return Response(
            {
                "success": True,
                "message": "User has been deactivated",
                "user": UserAdminSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class AdminUserRestoreView(APIView):
    """
    Admin endpoint to restore a soft-deleted user.
    """

    permission_classes = [IsSuperAdmin]

    def post(self, request, user_id):
        """
        Restore a soft-deleted user.
        """
        try:
            user = User.all_objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if actually deleted
        if not user.is_deleted:
            return Response(
                {"error": "User is not deactivated"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Restore user
        user.restore()

        logger.info(f"User {user_id} restored by admin {request.user.id}")

        return Response(
            {
                "success": True,
                "message": "User has been restored",
                "user": UserAdminSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class AdminUserHardDeleteView(APIView):
    """
    Admin endpoint to permanently delete a user.
    Only allowed if user has no dependent business data.
    """

    permission_classes = [IsSuperAdmin]

    def post(self, request, user_id):
        """
        Permanently delete a user.

        Request body:
        {
            "confirm": true
        }

        This operation is irreversible and only allowed if:
        - User has no dependent business entities (warehouses, orders, etc.)
        - Explicit confirmation is provided
        """
        serializer = UserHardDeleteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.all_objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Prevent deleting yourself
        if user.id == request.user.id:
            return Response(
                {"error": "You cannot delete your own account"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent deleting superusers (unless you're also a superuser)
        if user.is_superuser and not request.user.is_superuser:
            return Response(
                {"error": "Only superusers can delete other superusers"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Check for dependent data
        has_deps, deps = user.has_dependent_data()
        if has_deps:
            return Response(
                {
                    "error": "Cannot permanently delete user with dependent data. Use soft delete instead.",
                    "dependencies": deps,
                    "suggestion": "Deactivate the user instead of hard deleting",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Store user info for logging
        user_email = user.email
        user_role = user.role

        # Perform hard delete
        user.delete()

        logger.warning(
            f"User {user_id} ({user_email}, {user_role}) permanently deleted by admin {request.user.id}"
        )

        return Response(
            {"success": True, "message": "User has been permanently deleted"},
            status=status.HTTP_200_OK,
        )


class AdminUserDependenciesView(APIView):
    """
    Admin endpoint to check user's dependent data before deletion.
    """

    permission_classes = [IsSuperAdmin]

    def get(self, request, user_id):
        """
        Check what dependent data a user has.
        Useful for admins to understand impact before deletion.
        """
        try:
            user = User.all_objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        has_deps, deps = user.has_dependent_data()

        return Response(
            {
                "user_id": user_id,
                "email": user.email,
                "has_dependencies": has_deps,
                "dependencies": deps,
                "can_hard_delete": not has_deps,
                "recommendation": "soft_delete" if has_deps else "hard_delete_allowed",
            },
            status=status.HTTP_200_OK,
        )


class ProfilePictureUploadView(APIView):
    """
    Upload profile picture for the authenticated user.
    """

    permission_classes = [IsAuthenticated]

    ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
    ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
    MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB
    BUCKET_NAME = "profile-pictures"

    def post(self, request):
        """
        Upload a profile picture for the authenticated user.

        Request: multipart/form-data with 'image' file field
        Accepts: jpg, jpeg, png, webp (max 2MB)

        Returns:
            { "profile_image_url": "<public_url>" }
        """
        from configs.supabase_storage import SupabaseStorage

        # Check if file is present
        if "image" not in request.FILES:
            return Response(
                {"error": "No image file provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        image_file = request.FILES["image"]

        # Validate file size
        if image_file.size > self.MAX_FILE_SIZE:
            return Response(
                {
                    "error": f"File size exceeds maximum allowed size of {self.MAX_FILE_SIZE // (1024 * 1024)}MB"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate content type
        if image_file.content_type not in self.ALLOWED_CONTENT_TYPES:
            return Response(
                {
                    "error": f"Invalid file type. Allowed types: {', '.join(self.ALLOWED_EXTENSIONS)}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get file extension from content type
        ext_map = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
        }
        file_ext = ext_map.get(image_file.content_type, "jpg")

        # Construct deterministic file path: profile-pictures/{user_id}/profile.{ext}
        user = request.user
        file_path = f"{user.id}/profile.{file_ext}"

        try:
            # Upload to Supabase Storage with upsert to overwrite existing
            result = SupabaseStorage.upload_django_file(
                bucket_name=self.BUCKET_NAME,
                file_path=file_path,
                django_file=image_file,
                upsert=True,
            )

            if not result.get("success"):
                logger.error(
                    f"Failed to upload profile picture for user {user.id}: {result.get('error')}"
                )
                return Response(
                    {"error": "Failed to upload image"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # Update user's profile_image_url
            public_url = result.get("url")
            user.profile_image_url = public_url
            user.save(update_fields=["profile_image_url"])

            logger.info(f"Profile picture uploaded successfully for user {user.id}")

            return Response(
                {"profile_image_url": public_url}, status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(
                f"Error uploading profile picture for user {user.id}: {str(e)}"
            )
            return Response(
                {"error": "Failed to upload image"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
