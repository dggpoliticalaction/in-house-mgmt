from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import TicketViewSet, TicketAuditlogViewSet

router = DefaultRouter()
router.register('tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    path('', include(router.urls)),
    path('tickets/<int:ticket_id>/audit/', TicketAuditlogViewSet.as_view({'get': 'list'}), name='ticket-audit-list'),
]
