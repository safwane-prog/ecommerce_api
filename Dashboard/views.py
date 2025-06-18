from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import logout, authenticate, login as django_login
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

# التحقق إذا كان المستخدم مسؤول (admin)
def is_admin(user):
    return user.is_authenticated and user.is_staff

# ديكوريتر موحد للمشرفين
def admin_required(view_func):
    return login_required(login_url='Dashboard_login')(user_passes_test(is_admin)(view_func))

# API لتسجيل الدخول
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login as django_login
from django.http import JsonResponse
import json
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import authenticate, login as django_login
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from users.serializers import CompleteUserProfileSerializer  # تأكد أن هذا موجود
from django.conf import settings

@method_decorator(csrf_exempt, name='dispatch')
class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user and user.is_staff:
            django_login(request, user)

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            response = Response({
                'access': access_token,
                'refresh': refresh_token,
                'profile': CompleteUserProfileSerializer(user).data
            }, status=status.HTTP_200_OK)

            # وضع التوكن في الكوكيز
            response.set_cookie('access_token', access_token, httponly=True, samesite='Lax', secure=not settings.DEBUG)
            response.set_cookie('refresh_token', refresh_token, httponly=True, samesite='Lax', secure=not settings.DEBUG)

            return response

        return Response({'detail': 'بيانات الاعتماد غير صحيحة أو المستخدم ليس أدمن'}, status=status.HTTP_401_UNAUTHORIZED)




@admin_required
def Dashboard(request):
    return render(request, 'Dashboard/Dashboard.html')

@admin_required
def product(request):
    return render(request, 'products/product.html')

@admin_required
def settingsbord(request):
    return render(request, 'settings/settings.html')

@admin_required
def orders(request):
    return render(request, 'orders/order.html')

@admin_required
def add_product(request):
    return render(request, 'products/Add_product.html')

@admin_required
def Customers(request):
    return render(request, 'login/Customers.html')

# عرض صفحة تسجيل الدخول (frontend)
def login(request):
    return render(request, 'login/login.html')

# تسجيل خروج
def Logout(request):
    if request.method == 'POST':  # تأكد أن الطلب هو POST فقط
        logout(request)
        return redirect('Dashboard_login')
    return render(request, 'login/Logout.html')


@admin_required
def discounts(request):
    return render(request, 'Dashboard/discounts.html')



@admin_required
def messages(request):
    return render(request, 'orders/messages.html')

@admin_required
def Add_Discount(request):
    return render(request, 'user/Add_Discount.html')

@admin_required
def Edit_product(request):
    return render(request, 'products/edit_product.html')













# ================================================================
# ================================================================
# ================================================================
# ================================================================




