from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Company, BusinessUnit, Metric
from .serializers import CompanySerializer, BusinessUnitSerializer, MetricSerializer
from django.core.exceptions import ObjectDoesNotExist


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    @action(detail=True, methods=['get'], url_path='esg-summary')
    def esg_summary(self, request, pk=None):
        """
        Returns aggregated ESG metrics for a company.
        """
        company = self.get_object()
        metrics = Metric.objects.filter(business_unit__company=company)

        summary = {
            "total_metrics": metrics.count(),
            "environmental": metrics.filter(esg_category="ENVIRONMENTAL").count(),
            "social": metrics.filter(esg_category="SOCIAL").count(),
            "governance": metrics.filter(esg_category="GOVERNANCE").count(),
            "verified": metrics.filter(is_verified=True).count(),
            "latest_reporting_year": (
                metrics.order_by('-reporting_year').first().reporting_year
                if metrics.exists() else None
            ),
        }
        return Response(summary)
    

class BusinessUnitViewSet(viewsets.ModelViewSet):
    queryset = BusinessUnit.objects.all()
    serializer_class = BusinessUnitSerializer

class MetricViewSet(viewsets.ModelViewSet):
    queryset = Metric.objects.all()
    serializer_class = MetricSerializer
