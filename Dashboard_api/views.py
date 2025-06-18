from django.shortcuts import render,get_object_or_404
from backend_api.serializers import *
from backend_api.models import *
from rest_framework.decorators import api_view
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated
from .permissions import IsOwnerOrAdmin





class DeleteProductView(APIView):
    def delete(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            product.delete()
            return Response({'detail': 'تم حذف المنتج بنجاح'}, status=status.HTTP_204_NO_CONTENT)
        except Product.DoesNotExist:
            return Response({'detail': 'المنتج غير موجود'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'detail': f'خطأ داخلي: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework import viewsets
from Dashboard.models import EcommerceHomeSettings,EcommerceContactSettings
from .serializers import EcommerceHomeSettingsSerializer
from rest_framework.permissions import IsAuthenticated

class EcommerceHomeSettingsViewSet(viewsets.ModelViewSet):
    queryset = EcommerceHomeSettings.objects.all()
    serializer_class = EcommerceHomeSettingsSerializer
    permission_classes = [IsAuthenticated]


from rest_framework import viewsets
from Dashboard.models import EcommerceContactSettings
from .serializers import EcommerceContactSettingsSerializer

class EcommerceContactSettingsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EcommerceContactSettings.objects.all()
    serializer_class = EcommerceContactSettingsSerializer






from django.utils import timezone
from datetime import timedelta
from backend_api.models import Product, Order
from users.models import  CustomUser
from django.db.models import Count, Sum


class DashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now()
        last_month = today - timedelta(days=30)

        # عدد المنتجات، الطلبات، المستخدمين الكلي
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        total_users = CustomUser.objects.count()

        # عددهم في آخر شهر
        products_last_month = Product.objects.filter(created_at__gte=last_month).count()
        orders_last_month = Order.objects.filter(created_at__gte=last_month).count()
        users_last_month = CustomUser.objects.filter(date_joined__gte=last_month).count()

        # نسبة الزيادة
        def calculate_increase(new, total):
            if total == 0:
                return 100 if new > 0 else 0
            return round((new / total) * 100, 2)

        product_growth = calculate_increase(products_last_month, total_products)
        order_growth = calculate_increase(orders_last_month, total_orders)
        user_growth = calculate_increase(users_last_month, total_users)

        # الطلبات المدفوعة
        paid_orders = Order.objects.filter(is_paid=True)
        paid_orders_count = paid_orders.count()
        total_revenue = paid_orders.aggregate(total=Sum('total_price'))['total'] or 0

        # الإيرادات هذا الشهر والماضي
        first_day_of_this_month = today.replace(day=1)
        first_day_of_last_month = (first_day_of_this_month - timedelta(days=1)).replace(day=1)
        last_day_of_last_month = first_day_of_this_month - timedelta(days=1)

        revenue_this_month = paid_orders.filter(
            created_at__date__gte=first_day_of_this_month
        ).aggregate(total=Sum('total_price'))['total'] or 0

        revenue_last_month = paid_orders.filter(
            created_at__date__gte=first_day_of_last_month,
            created_at__date__lte=last_day_of_last_month
        ).aggregate(total=Sum('total_price'))['total'] or 0

        # نسبة نمو الأرباح
        if revenue_last_month > 0:
            revenue_growth_percentage = round(((revenue_this_month - revenue_last_month) / revenue_last_month) * 100, 2)
        else:
            revenue_growth_percentage = 100 if revenue_this_month > 0 else 0

        return Response({
            "total_products": total_products,
            "new_products_last_month": products_last_month,
            "product_growth_percentage": product_growth,

            "total_orders": total_orders,
            "new_orders_last_month": orders_last_month,
            "order_growth_percentage": order_growth,

            "total_users": total_users,
            "new_users_last_month": users_last_month,
            "user_growth_percentage": user_growth,

            "paid_orders_count": paid_orders_count,
            "total_revenue": float(total_revenue),

            "revenue_this_month": float(revenue_this_month),
            "revenue_last_month": float(revenue_last_month),
            "revenue_growth_percentage": revenue_growth_percentage,
        })








from rest_framework import viewsets
from backend_api.models import About
from Dashboard.models import AdminProfile, EcommerceHomeSettings, EcommerceContactSettings
from .serializers import (
    AboutSerializer,
    AdminProfileSerializer,
    EcommerceHomeSettingsSerializer,
    EcommerceContactSettingsSerializer
)

class AboutViewSet(viewsets.ModelViewSet):
    queryset = About.objects.all()
    serializer_class = AboutSerializer

class AdminProfileViewSet(viewsets.ModelViewSet):
    queryset = AdminProfile.objects.all()
    serializer_class = AdminProfileSerializer

class EcommerceHomeSettingsViewSet(viewsets.ModelViewSet):
    queryset = EcommerceHomeSettings.objects.all()
    serializer_class = EcommerceHomeSettingsSerializer

class EcommerceContactSettingsViewSet(viewsets.ModelViewSet):
    queryset = EcommerceContactSettings.objects.all()
    serializer_class = EcommerceContactSettingsSerializer









from backend_api.models import *
from users.models import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
from django.db.models import Sum, Count, Avg, F
from datetime import timedelta
from django.core.cache import cache

from .serializers import MainDashboardSerializer


class MainDashboardAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = cache.get('main_dashboard_data')

        if not data:
            now = timezone.now()
            today = now.date()
            month_ago = today - timedelta(days=30)

            ### Revenue Summary
            total_revenue = Order.objects.filter(is_paid=True).aggregate(total=Sum('total_price'))['total'] or 0
            monthly_revenue = Order.objects.filter(is_paid=True, created_at__gte=month_ago).aggregate(total=Sum('total_price'))['total'] or 0
            today_revenue = Order.objects.filter(is_paid=True, created_at__date=today).aggregate(total=Sum('total_price'))['total'] or 0

            revenue = {
                "total": total_revenue,
                "month": monthly_revenue,
                "today": today_revenue
            }

            ### Orders Summary
            total_orders = Order.objects.count()
            completed_orders = Order.objects.filter(status='completed').count()
            pending_orders = Order.objects.filter(status='pending').count()
            cancelled_orders = Order.objects.filter(status='cancelled').count()

            orders = {
                "total": total_orders,
                "completed": completed_orders,
                "pending": pending_orders,
                "cancelled": cancelled_orders
            }

            ### Customers Summary
            total_customers = CustomUser.objects.count()
            new_customers = CustomUser.objects.filter(date_joined__gte=month_ago).count()

            customers = {
                "total": total_customers,
                "new_this_month": new_customers
            }

            ### Stock Health
            low_stock = Product.objects.filter(stock__lte=5, stock__gt=0).count()
            out_of_stock = Product.objects.filter(stock=0).count()

            stock_health = {
                "low_stock": low_stock,
                "out_of_stock": out_of_stock
            }

            ### Top Selling Products
            top_selling_products = list(
                CartItem.objects.values('product__title')
                .annotate(total_sold=Sum('quantity'))
                .order_by('-total_sold')[:5]
            )

            ### Top Customers
            top_customers = list(
                Order.objects.values('user__username')
                .annotate(total_spent=Sum('total_price'))
                .order_by('-total_spent')[:5]
            )

            ### Top Viewed Products
            top_viewed_products = list(
                Product.objects.order_by('-views')
                .values('title', 'views')[:5]
            )

            ### Top Rated Products
            top_rated_products = list(
                Review.objects.values('product__title')
                .annotate(avg_rating=Avg('rating'), total_reviews=Count('id'))
                .order_by('-avg_rating')[:5]
            )

            ### Coupons Summary
            coupons_used = CouponUsage.objects.count()

            coupons_summary = {
                "used_count": coupons_used
            }

            ### Final data structure
            data = {
                "revenue": revenue,
                "orders": orders,
                "customers": customers,
                "stock_health": stock_health,
                "top_selling_products": top_selling_products,
                "top_customers": top_customers,
                "top_viewed_products": top_viewed_products,
                "top_rated_products": top_rated_products,
                "coupons_summary": coupons_summary
            }

            cache.set('main_dashboard_data', data, timeout=300)

        serializer = MainDashboardSerializer(data)
        return Response(serializer.data)























# views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from backend_api.models import AdminReply, Contact, Subscribe, Review, SiteExperienceReview
from .serializers import (
    AdminReplySerializer, ContactSerializer, SubscribeSerializer,
    ReviewSerializer, SiteExperienceReviewSerializer, AddAdminReplySerializer
)

# عرض و حذف Contact

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer


class ContactDeleteView(generics.DestroyAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer

# إضافة رد على Contact

class AddAdminReplyViewSet(viewsets.ModelViewSet):
    queryset = AdminReply.objects.all()
    serializer_class = AdminReplySerializer


# عرض و حذف AdminReply
class AdminReplyViewSet(viewsets.ModelViewSet):
    queryset = AdminReply.objects.all()
    serializer_class = AdminReplySerializer

class AdminReplyDeleteView(generics.DestroyAPIView):
    queryset = AdminReply.objects.all()
    serializer_class = AdminReplySerializer

# عرض و حذف Subscribe
class SubscribeListView(generics.ListAPIView):
    queryset = Subscribe.objects.all()
    serializer_class = SubscribeSerializer

class SubscribeDeleteView(generics.DestroyAPIView):
    queryset = Subscribe.objects.all()
    serializer_class = SubscribeSerializer

# عرض و حذف Review
class ReviewListView(generics.ListAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class ReviewDeleteView(generics.DestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

# عرض و حذف SiteExperienceReview
class SiteExperienceReviewListView(generics.ListAPIView):
    queryset = SiteExperienceReview.objects.all()
    serializer_class = SiteExperienceReviewSerializer

class SiteExperienceReviewDeleteView(generics.DestroyAPIView):
    queryset = SiteExperienceReview.objects.all()
    serializer_class = SiteExperienceReviewSerializer
