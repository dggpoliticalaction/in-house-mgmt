from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import TicketViewSet

router = DefaultRouter()
router.register('tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    path('', include(router.urls)),
]
