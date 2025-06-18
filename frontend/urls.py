from django.urls import path
from .views import *
from . import views


urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('products/', views.product_list, name='product_list'),
    path('product-detail.html', views.product_detail_page, name='product_detail_page'),
    path('Cart/', views.view_cart, name='view_cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('login/', views.login_page, name='loginpage'),
    path('register/', views.register_page, name='registerpage'),
    path('add-Review/', views.Review, name='Review'),
    path('privacy-policy/', views.privacy_policy, name='privacy_policy'),
    path('profile/', views.accounts, name='accounts'),
    path('loginfgs/', views.loginfgs, name='loginfgs'),
]

from django.urls import path
from django.views.generic import TemplateView

