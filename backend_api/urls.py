from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from . import views
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='products')
router.register(r'admin-products', Product_2ViewSet, basename='admin-products')
router.register('colors', ColorProductViewSet, basename='color')
router.register('sizes', SizeProductViewSet, basename='size')
router.register('category-products', CategoryProductViewSet, basename='categoryproduct')
router.register('categories', CategoryViewSet, basename='category')
router.register('contact-messages', ContactMessageViewSet, basename='contact-message')
router.register('admin-replies', AdminReplyViewSet, basename='admin-reply')
router.register(r'discounts', DiscountViewSet, basename='discount')
router.register(r'coupons', CouponViewSet, basename='coupon')
router.register(r'about', AboutViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('get_colors/', views.get_colors,name='get_colors'),
    path('get_sizes/', views.get_sizes,name='get_sizes'),
    path('get_category_products/', views.get_category_products,name='get_category_products'),
    path('get_categories/', views.get_categories,name='get_categories'),
    path('products/<int:pk>/', views.product_detail_api, name='product_detail_api'),
    path('add-to-cart/', AddToCartView.as_view(), name='add-to-cart'),
    path('cart/', CartDetailView.as_view(), name='cart-detail'),
    path('wishlist/', WishlistProductsView.as_view(), name='wishlist-products'),
    path('add-to-wishlist/', AddToWishlistView.as_view(), name='add-to-wishlist'),
    path('superuser-only/', SuperUserOnlyView.as_view(), name='superuser-only'),
    # path('admin-login/', AdminLoginView.as_view(), name='login'),
    path('update-product/<int:pk>/', ProductUpdateAPIView.as_view(), name='update-product'),
    path('wishlist/delete/<int:product_id>/', WishlistDeleteView.as_view(), name='delete-wishlist'),
    path('subscribe/', SubscribeView.as_view(), name='subscribe'),
    path('subscribe/<int:pk>/', SubscribeView.as_view()),
    path('contact/', ContactAPIView.as_view(), name='contact_api'),
    path('contact-messages/', ContactMessageAPIView.as_view(), name='contact-messages-list'),
    path('contact/<int:pk>/', ContactMessageAPIView.as_view(), name='contact-message-delete'),
    path('create-order/', CreateOrderView.as_view(), name='create-order'),
    path("validate-coupon/",views.validate_coupon, name="validate-coupon"),
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('discounts/', DiscountListAPIView.as_view(), name='discount-list'),
    path('cart/update/<int:product_id>/', UpdateCartItemQuantityView.as_view(), name='cart-update'),
    path('cart/delete/<int:product_id>/', DeleteCartItemView.as_view(), name='cart-delete'),
    path('reviews/add/', AddReviewView.as_view(), name='add-review'),
    path('reviews/submit/<int:product_id>/', SubmitReviewAPIView.as_view(), name='submit-review'),
    path('reviews/check/<int:product_id>/', HasUserReviewedProduct.as_view(), name='check-review'),
    path('site-review/', SubmitSiteReview.as_view(), name='site-review'),
    path('site-reviews/', views.SiteExperienceReviewCreate.as_view(), name='site-review-create'),
    path('get_site-reviews/', SiteExperienceReviewListAPIView.as_view(), name='site_reviews'),
    path('get_all_reviews/', ReviewListAPIView.as_view(), name='review-list'),
    path('cart-count/', cart_items_count, name='cart_items_count'),
    path('check/<int:product_id>/', CheckProductInCartAPIView.as_view(), name='check-product-in-cart'),
    path('best-sellers/', best_selling_products, name='best-selling-products'),
    path('get-Reply/', get_Reply, name='get_Reply'),
    path('notifications/mark-read/', mark_all_notifications_read, name='notificatio'),
    path('has-reviewed/', HasUserReviewedView.as_view(), name='has-reviewed'),
    path('orders/delete/<int:order_id>/', DeleteOrderView.as_view(), name='delete-order'),
    path('orders/<int:order_id>/update-payment/', UpdateOrderPaymentStatusView.as_view(), name='update-order-payment'),
    path('statistics-coupons/', CouponStatsAPIView.as_view(), name='coupon-stats'),
    path('notifications/delete-all/', delete_all_notifications, name='delete_all_notifications'),


]
