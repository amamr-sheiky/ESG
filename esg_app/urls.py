from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, BusinessUnitViewSet, MetricViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)
router.register(r'business-units', BusinessUnitViewSet)
router.register(r'metrics', MetricViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
