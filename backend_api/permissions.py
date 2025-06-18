from rest_framework.permissions import BasePermission

class IsSuperUser(BasePermission):
    """
    يسمح فقط للسوبر يوزر بالوصول.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser
