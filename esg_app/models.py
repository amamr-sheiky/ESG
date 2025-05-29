# esg_app/models.py
from django.db import models
from django.core.validators import MinLengthValidator
from django.utils import timezone

class Company(models.Model):
    """
    Represents an organization reporting ESG data.
    Captures high-level metadata about the company.
    """
    SECTOR_CHOICES = [
        ('TECHNOLOGY', 'Technology'),
        ('HEALTHCARE', 'Healthcare'),
        ('FINANCE', 'Finance'),
        ('ENERGY', 'Energy'),
        ('MANUFACTURING', 'Manufacturing'),
        ('RETAIL', 'Retail'),
        ('AGRICULTURE', 'Agriculture'),
        ('TRANSPORTATION', 'Transportation'),
        ('REAL_ESTATE', 'Real Estate'),
        ('UTILITIES', 'Utilities'),
        ('OTHER', 'Other'),
    ]
    
    name = models.CharField(
        max_length=255,
        validators=[MinLengthValidator(2)],
        help_text="Company name"
    )
    location = models.CharField(
        max_length=255,
        help_text="Company headquarters location"
    )
    sector = models.CharField(
        max_length=50,
        choices=SECTOR_CHOICES,
        help_text="Industry sector of the company"
    )
    reporting_period_start = models.DateField(
        help_text="Start date of the current reporting period"
    )
    reporting_period_end = models.DateField(
        help_text="End date of the current reporting period"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Optional description of the company"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Company"
        verbose_name_plural = "Companies"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.sector})"
    
    def clean(self):
        """Validate that reporting period end is after start"""
        from django.core.exceptions import ValidationError
        if self.reporting_period_end <= self.reporting_period_start:
            raise ValidationError(
                "Reporting period end date must be after start date"
            )


class BusinessUnit(models.Model):
    """
    Represents a subdivision or department of a company.
    Each Business Unit is associated with a Company.
    """
    UNIT_TYPE_CHOICES = [
        ('DEPARTMENT', 'Department'),
        ('DIVISION', 'Division'),
        ('SUBSIDIARY', 'Subsidiary'),
        ('BRANCH', 'Branch'),
        ('FACILITY', 'Facility'),
        ('REGION', 'Region'),
        ('OTHER', 'Other'),
    ]
    
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='business_units',
        help_text="Company this business unit belongs to"
    )
    name = models.CharField(
        max_length=255,
        validators=[MinLengthValidator(2)],
        help_text="Business unit name"
    )
    unit_type = models.CharField(
        max_length=50,
        choices=UNIT_TYPE_CHOICES,
        help_text="Type of business unit"
    )
    location = models.CharField(
        max_length=255,
        help_text="Physical location of the business unit"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Optional description of the business unit operations"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this business unit is currently active"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Business Unit"
        verbose_name_plural = "Business Units"
        ordering = ['company__name', 'name']
        unique_together = ['company', 'name']
    
    def __str__(self):
        return f"{self.company.name} - {self.name}"


class Metric(models.Model):
    """
    Represents a measurable ESG parameter linked to a Business Unit.
    Supports reporting values over time with flexible metric categories.
    """
    ESG_CATEGORY_CHOICES = [
        ('ENVIRONMENTAL', 'Environmental'),
        ('SOCIAL', 'Social'),
        ('GOVERNANCE', 'Governance'),
    ]
    
    UNIT_CHOICES = [
        ('KWH', 'Kilowatt Hours'),
        ('TONNES', 'Tonnes'),
        ('LITERS', 'Liters'),
        ('HOURS', 'Hours'),
        ('PERCENTAGE', 'Percentage'),
        ('COUNT', 'Count'),
        ('RATIO', 'Ratio'),
        ('CURRENCY', 'Currency'),
        ('OTHER', 'Other'),
    ]
    
    business_unit = models.ForeignKey(
        BusinessUnit,
        on_delete=models.CASCADE,
        related_name='metrics',
        help_text="Business unit this metric belongs to"
    )
    name = models.CharField(
        max_length=255,
        validators=[MinLengthValidator(2)],
        help_text="Name of the ESG metric"
    )
    esg_category = models.CharField(
        max_length=50,
        choices=ESG_CATEGORY_CHOICES,
        help_text="ESG category (Environmental, Social, or Governance)"
    )
    metric_type = models.CharField(
        max_length=100,
        help_text="Specific type of metric (e.g., 'Energy Consumption', 'Safety Hours')"
    )
    unit_of_measurement = models.CharField(
        max_length=50,
        choices=UNIT_CHOICES,
        help_text="Unit of measurement for this metric"
    )
    value = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        help_text="Numeric value of the metric"
    )
    reporting_year = models.PositiveIntegerField(
        help_text="Year this metric value was reported"
    )
    reporting_period = models.CharField(
        max_length=50,
        default='ANNUAL',
        help_text="Reporting period (e.g., 'Q1', 'Q2', 'ANNUAL')"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Optional description or notes about this metric"
    )
    data_source = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Source of the data for this metric"
    )
    is_verified = models.BooleanField(
        default=False,
        help_text="Whether this metric has been verified/audited"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Metric"
        verbose_name_plural = "Metrics"
        ordering = ['-reporting_year', 'esg_category', 'name']
        unique_together = ['business_unit', 'name', 'reporting_year', 'reporting_period']
    
    def __str__(self):
        return f"{self.business_unit.company.name} - {self.name} ({self.reporting_year})"
    
    def clean(self):
        """Validate reporting year is not in the future"""
        from django.core.exceptions import ValidationError
        current_year = timezone.now().year
        if self.reporting_year > current_year:
            raise ValidationError(
                f"Reporting year cannot be in the future (current year: {current_year})"
            )
