# products/urls.py
from .views import *
from . import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EcommerceHomeSettingsViewSet
router = DefaultRouter()
router.register(r'home-settings', EcommerceHomeSettingsViewSet, basename='home-settings')
router.register(r'contact-views', EcommerceContactSettingsViewSet, basename='contact-settings')
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'admin-replies', AdminReplyViewSet, basename='adminreplies')
router.register(r'add-reply', AddAdminReplyViewSet, basename='contactsaddreply')
router.register(r'about', AboutViewSet)
router.register(r'admin-profile', AdminProfileViewSet)
router.register(r'home-settings', EcommerceHomeSettingsViewSet)
router.register(r'contact-settings', EcommerceContactSettingsViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('delete-product/<int:pk>/', DeleteProductView.as_view(), name='delete-product'),
    path('delete-product/<int:pk>/', views.DeleteProductView.as_view(), name='delete-product'),
    path('dashboard/stats/', DashboardStatsAPIView.as_view(), name='dashboard-stats'),
    path('statistics/', MainDashboardAPIView.as_view(), name='statistics'),


    path('contacts/delete/<int:pk>/', views.ContactDeleteView.as_view()),

    # AdminReply
    path('admin-replies/delete/<int:pk>/', views.AdminReplyDeleteView.as_view()),

    # Subscribe
    path('subscribes/', views.SubscribeListView.as_view()),
    path('subscribes/delete/<int:pk>/', views.SubscribeDeleteView.as_view()),

    # Review
    path('reviews/', views.ReviewListView.as_view()),
    path('reviews/delete/<int:pk>/', views.ReviewDeleteView.as_view()),

    # SiteExperienceReview
    path('site-experience-reviews/', views.SiteExperienceReviewListView.as_view()),
    path('site-experience-reviews/delete/<int:pk>/', views.SiteExperienceReviewDeleteView.as_view()),
]


