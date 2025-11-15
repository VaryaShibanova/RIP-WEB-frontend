from django.urls import path, include

urlpatterns = [
    path('api/async/', include('calculator.urls')),
]