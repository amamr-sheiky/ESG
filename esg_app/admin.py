from django.contrib import admin
from .models import Company, BusinessUnit, Metric

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'sector', 'location', 'reporting_period_start', 'reporting_period_end', 'created_at')
    search_fields = ('name', 'sector', 'location')
    list_filter = ('sector',)
    ordering = ('name',)

@admin.register(BusinessUnit)
class BusinessUnitAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'unit_type', 'location', 'is_active', 'created_at')
    search_fields = ('name', 'company__name', 'location')
    list_filter = ('unit_type', 'is_active', 'company')
    ordering = ('company', 'name')

@admin.register(Metric)
class MetricAdmin(admin.ModelAdmin):
    list_display = ('name', 'business_unit', 'esg_category', 'metric_type', 'value', 'reporting_year', 'reporting_period', 'is_verified')
    search_fields = ('name', 'business_unit__name', 'metric_type')
    list_filter = ('esg_category', 'reporting_year', 'is_verified', 'business_unit')
    ordering = ('-reporting_year', 'esg_category', 'name')
