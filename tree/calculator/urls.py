from django.urls import path
from . import views

urlpatterns = [
    path('calculate', views.calculate_years, name='calculate_years'),
]