from django.urls import path
from .views import *
from . import views
from django.urls import path, include


urlpatterns = [
    path('', views.Dashboard, name="Dashboard"),
    path('product/', views.product, name="product"),
    path('settings/', views.settingsbord, name="settings"),
    path('orders/', views.orders, name="orders"),
    path('Add-product/', views.add_product, name="add_product"),
    path('customers/', views.Customers, name="customers"),
    path('discounts/', views.discounts, name="discounts"),
    path('messages/', views.messages, name="messages"),
    path('login/', views.login, name="Dashboard_login"),
    path('Logout/', views.Logout, name="Logout"),
    path('Add_Discount/', views.Add_Discount, name="Add_Discount"),
    path('admin-login/', AdminLoginView.as_view(), name='admin-login'),
    path('product-edit.html', views.Edit_product, name='Edit_product'),
]


