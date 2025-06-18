from rest_framework.permissions import BasePermission

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.owner == request.user
