from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, LoginView, LogoutView, UserStatusView, UserProfileView,
    UserProfileUpdateView, UserDeleteAPIView, UserListAPIView,
    AdminUserViewSet, AdminCreateUserAPIView, TokenRefreshViewCustom,CurrentUserProfileViewSet,UpdateProfilePictureView,CustomUserViewSet,CustomUserCreateView,CompleteUserDataAPIView
)

router = DefaultRouter()
router.register(r'admin-users', AdminUserViewSet, basename='admin-users')
router.register(r'profile-user', CurrentUserProfileViewSet, basename='user-profile')
router.register(r'show-custom', CustomUserViewSet)

urlpatterns = [
    path('my-complete-data/', CompleteUserDataAPIView.as_view(), name='my-complete-data'),
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('create/', CustomUserCreateView.as_view(), name='create-user'),
    path('admin-register-user/', AdminCreateUserAPIView.as_view(), name='user-register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('status/', UserStatusView.as_view(), name='user-status'),
    path('delete/<int:pk>/', UserDeleteAPIView.as_view(), name='user-delete'),
    path('all/', UserListAPIView.as_view(), name='user-list'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/update/', UserProfileUpdateView.as_view(), name='update-profile'),
    path('token/refresh/', TokenRefreshViewCustom.as_view(), name='token_refresh_custom'),
    path('me/', UserProfileUpdateView.as_view(), name='user-profile'),
    path('update-profile-picture/', UpdateProfilePictureView.as_view(), name='update-profile-picture'),
    path('update-user-profile/', UserProfileView.as_view(), name='user-profile'),
]
