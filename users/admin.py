from django.contrib import admin
from .models import *
# Register your models here.
from django.contrib import admin
from django.core.exceptions import PermissionDenied
from .models import CustomUser

class CustomUserAdmin(admin.ModelAdmin):
    def has_delete_permission(self, request, obj=None):
        # منع الحذف نهائياً لمستخدم الـ superadmin (مثلاً username = 'superadmin')
        if obj and obj.username == 'superadmin':
            return False
        return super().has_delete_permission(request, obj)

    def delete_model(self, request, obj):
        if obj.username == 'superadmin':
            raise PermissionDenied("لا يمكن حذف المستخدم الأدمن الافتراضي.")
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        if queryset.filter(username='superadmin').exists():
            raise PermissionDenied("لا يمكن حذف المستخدم الأدمن الافتراضي.")
        super().delete_queryset(request, queryset)

admin.site.register(CustomUser, CustomUserAdmin)

admin.site.register(UserProfile)

