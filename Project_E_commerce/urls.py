from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenVerifyView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('frontend.urls')),
    path('api/users/', include('users.urls')),
    path('api/', include('backend_api.urls')),
    path('dashboard/', include('Dashboard.urls')),
    path('Board_api/', include('Dashboard_api.urls')),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)