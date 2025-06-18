from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .permissions import IsCustomAdmin  # استيراد الصلاحية المخصصة
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.conf import settings
from .serializers import RegisterSerializer, CompleteUserProfileSerializer, UserProfileInfoSerializer, CustomUserSerializer
from .models import CustomUser, UserProfile
from backend_api.models import Cart



from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and (user.is_superuser or getattr(user, 'is_admin', False)))



class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            response = Response({
                'username': user.username,
                'email': user.email,
                'access': access_token,
                'refresh': refresh_token
            }, status=status.HTTP_201_CREATED)
            response.set_cookie('access_token', access_token, httponly=True, samesite='Lax', secure=not settings.DEBUG)
            response.set_cookie('refresh_token', refresh_token, httponly=True, samesite='Lax', secure=not settings.DEBUG)
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            response = Response({
                'access': access_token,
                'refresh': refresh_token,
                'profile': CompleteUserProfileSerializer(user).data
            }, status=status.HTTP_200_OK)
            response.set_cookie('access_token', access_token, httponly=True, samesite='Lax', secure=not settings.DEBUG)
            response.set_cookie('refresh_token', refresh_token, httponly=True, samesite='Lax', secure=not settings.DEBUG)
            return response
        return Response({'detail': 'بيانات الاعتماد غير صحيحة'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            response = Response({'detail': 'تم تسجيل الخروج بنجاح'}, status=status.HTTP_200_OK)
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            return response
        except Exception as e:
            return Response({'detail': f'خطأ أثناء تسجيل الخروج: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

class UserStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "authenticated": True,
            "username": request.user.username,
            "is_admin": request.user.is_admin
        })

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CompleteUserProfileSerializer(request.user)
        return Response(serializer.data)
    

class UserProfileUpdateView(generics.UpdateAPIView):
    serializer_class = UserProfileInfoSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.userprofile

class UserDeleteAPIView(generics.DestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsCustomAdmin]

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

class UserListAPIView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsCustomAdmin]

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CompleteUserProfileSerializer
    permission_classes = [IsCustomAdmin]

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({"message": "تم تعطيل المستخدم بنجاح"}, status=status.HTTP_200_OK)

from .serializers import CompleteUserProfileSerializer
from django.core.cache import cache

class CurrentUserProfileViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user = request.user
        # Cache user profile for 5 minutes
        cache_key = f'user_profile_{user.id}'
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        serializer = CompleteUserProfileSerializer(user, context={'request': request})
        cache.set(cache_key, serializer.data, timeout=300)  # Cache for 5 minutes
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminCreateUserAPIView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsCustomAdmin]

    def perform_create(self, serializer):
        user = serializer.save()
        is_admin = self.request.data.get('is_admin', False)
        user.is_admin = is_admin
        user.save()
        Cart.objects.create(user=user)
        profile_data = serializer.validated_data.get('userprofile', {})
        UserProfile.objects.create(
            user=user,
            first_name=profile_data.get('first_name', ''),
            last_name=profile_data.get('last_name', ''),
            phone=profile_data.get('phone', ''),
            address=profile_data.get('address', '')
        )
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

class TokenRefreshViewCustom(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({'detail': 'لم يتم العثور على رمز التحديث'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            new_refresh_token = str(refresh)
            response = Response({'access': access_token, 'refresh': new_refresh_token}, status=status.HTTP_200_OK)
            response.set_cookie('access_token', access_token, httponly=True, samesite='Lax', secure=not settings.DEBUG)
            response.set_cookie('refresh_token', new_refresh_token, httponly=True, samesite='Lax', secure=not settings.DEBUG)
            return response
        except Exception as e:
            return Response({'detail': f'رمز التحديث غير صالح: {str(e)}'}, status=status.HTTP_401_UNAUTHORIZED)

class AdminCreateUserAPIView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsCustomAdmin]

    def perform_create(self, serializer):
        user = serializer.save()
        is_admin = self.request.data.get('is_admin', False)
        user.is_admin = is_admin
        user.save()
        Cart.objects.create(user=user)
        profile_data = serializer.validated_data.get('userprofile', {})
        UserProfile.objects.create(
            user=user,
            first_name=profile_data.get('first_name', ''),
            last_name=profile_data.get('last_name', ''),
            phone=profile_data.get('phone', ''),
            address=profile_data.get('address', '')
        )

# profiles/views.py
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import UserProfile
from .serializers import UserProfileSerializer
from rest_framework import status

class UserProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.userprofile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile = request.user.userprofile
        serializer = UserProfileSerializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .serializers import ProfilePictureUpdateSerializer

class UpdateProfilePictureView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        serializer = ProfilePictureUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Profile picture updated successfully.', 'profile_picture': serializer.data['profile_picture']})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import CustomUser
from .serializers import CustomUserFullSerializer

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserFullSerializer
    permission_classes = [IsSuperAdmin]


    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_user(self, request, pk=None):
        user = self.get_object()
        user.delete()
        return Response({'detail': 'User deleted'}, status=status.HTTP_204_NO_CONTENT)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import CustomUserCreateSerializer

class CustomUserCreateView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        serializer = CustomUserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"detail": "User created successfully", "user_id": user.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



from rest_framework import generics, permissions
from .models import CustomUser
from .serializers import UserSerializer_2

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer_2
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user



# users/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser, UserProfile
from backend_api.models import Contact, Order, Wishlist, Review, AdminReply, CartItem
from .serializers import CompleteUserDataSerializer

class CompleteUserDataAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = UserProfile.objects.filter(user=user).first()
        orders = Order.objects.filter(user=user).prefetch_related('items__product')
        wishlists = Wishlist.objects.filter(user=user).select_related('product')
        reviews = Review.objects.filter(user=user).select_related('product')
        contacts = Contact.objects.filter(email=user.email)
        replies = AdminReply.objects.filter(contact_message__in=contacts)

        data = {
            "user": user,
            "profile": profile,
            "orders": orders,
            "wishlists": wishlists,
            "reviews": reviews,
            "admin_replies": replies
        }

        serializer = CompleteUserDataSerializer(data, context={'request': request})
        return Response(serializer.data)
