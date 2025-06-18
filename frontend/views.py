from django.shortcuts import render, get_object_or_404
from backend_api.models import Product
from django.views import View
from Dashboard.models import EcommerceHomeSettings

# دالة لاسترجاع الإعدادات
def get_settings():
    return EcommerceHomeSettings.objects.last()

# home
def base(request):
    settings_obj = get_settings()
    return render(request, 'core/base.html', {'Settings': settings_obj})

def home(request):
    settings_obj = get_settings()
    return render(request, 'core/home.html', {'Settings': settings_obj})

# about
def about(request):
    settings_obj = get_settings()
    return render(request, 'core/about.html', {'Settings': settings_obj})

# contact
def contact(request):
    settings_obj = get_settings()
    return render(request, 'core/contact.html', {'Settings': settings_obj})

# product_list
def product_list(request):
    settings_obj = get_settings()
    return render(request, 'store/product_list.html', {'Settings': settings_obj})

# product_detail_page
def product_detail_page(request):
    settings_obj = get_settings()
    return render(request, 'store/product_detail.html', {'Settings': settings_obj})

# view_cart
def view_cart(request):
    settings_obj = get_settings()
    return render(request, 'cart/cart.html', {'Settings': settings_obj})

# checkout
def checkout(request):
    settings_obj = get_settings()
    return render(request, 'orders/checkout.html', {'Settings': settings_obj})

# Review
def Review(request):
    settings_obj = get_settings()
    return render(request, 'orders/Review.html', {'Settings': settings_obj})

# register_page
def register_page(request):
    settings_obj = get_settings()
    return render(request, 'accounts/register.html', {'Settings': settings_obj})

# login_page
def login_page(request):
    settings_obj = get_settings()
    return render(request, 'accounts/login.html', {'Settings': settings_obj})

# privacy_policy
def privacy_policy(request):
    settings_obj = get_settings()
    return render(request, 'accounts/privacy_policy.html', {'Settings': settings_obj})

# accounts
def accounts(request):
    settings_obj = get_settings()
    return render(request, 'accounts/accounts.html', {'Settings': settings_obj})


def loginfgs(request):
    return render(request,'accounts/asdfghj.html')