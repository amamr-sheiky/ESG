# esg_app/admin.py
from django.contrib import admin
from .models import Company, BusinessUnit, Metric

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'sector', 'location', 'reporting_period_start', 'reporting_period_end']
    list_filter = ['sector', 'created_at']
    search_fields = ['name', 'location']
    ordering = ['name']

@admin.register(BusinessUnit)
class BusinessUnitAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'unit_type', 'location', 'is_active']
    list_filter = ['unit_type', 'is_active', 'company']
    search_fields = ['name', 'company__name', 'location']
    ordering = ['company__name', 'name']

@admin.register(Metric)
class MetricAdmin(admin.ModelAdmin):
    list_display = ['name', 'business_unit', 'esg_category', 'value', 'unit_of_measurement', 'reporting_year']
    list_filter = ['esg_category', 'reporting_year', 'unit_of_measurement', 'is_verified']
    search_fields = ['name', 'business_unit__name', 'business_unit__company__name']
    ordering = ['-reporting_year', 'esg_category', 'name']
