from django.urls import path, include
from django.views.generic import RedirectView
from django.contrib import admin
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('esg_app.urls')),
    path('', RedirectView.as_view(url='/api/', permanent=False)),  # Redirect root to /api/
    # JWT Auth endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Get access and refresh token
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Refresh access token
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),     # Verify a token
    
    path('', RedirectView.as_view(url='/api/', permanent=False)),  # Redirect root to /api/
]
