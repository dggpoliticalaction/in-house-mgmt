from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import Contact, Tag, TagAssignments
from .serializers import (
    ContactSerializer,
    TagSerializer,
    TagAssignmentSerializer,
)
from dggcrm.tickets.models import TicketAuditLog, TicketType

# TODO: Add permission_classes to these views
class ContactViewSet(viewsets.ModelViewSet):
    queryset = (
        Contact.objects
        .all()
        .prefetch_related("taggings__tag")
    )
    serializer_class = ContactSerializer

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "full_name",
        "email",
        "discord_id",
        "phone",
        "note",
    ]

    ordering_fields = [
        "created_at",
        "modified_at",
        "full_name",
        "discord_id",
    ]

    ordering = ["-created_at"]

    # TODO: Update search api to properly handle permissions,
    #   access, and search all fields
    def get_queryset(self):
        queryset = super().get_queryset()

        event_id = self.request.query_params.get("event")
        tag = self.request.query_params.get("tag")

        if event_id:
            queryset = queryset.filter(
                event_participations__event_id=event_id,
            )

        if tag:
            # allow filtering by tag id OR tag name
            if tag.isdigit():
                queryset = queryset.filter(taggings__tag__id=tag)
            else:
                queryset = queryset.filter(taggings__tag__name__iexact=tag)

        return queryset

    @action(detail=True, methods=['get'], url_path='acceptance-rate')
    def acceptance_rate(self, request, pk=None):
        """
        Calculate the acceptance rate for a contact based on ticket audit logs,
        broken down by ticket type.

        Returns a JSON with acceptance rates for each ticket type:
        - -1 if the contact was never offered that ticket type
        - percentage (0-100) of accepted roles for that type otherwise

        The acceptance field in TicketAuditLog.data:
        - 1 = accepted
        - 0 = not accepted
        """
        contact = self.get_object()
        response_data = {}

        # For each ticket type, calculate acceptance rate
        for ticket_type_value, ticket_type_label in TicketType.choices:
            # Filter audit logs for this specific ticket type
            audit_logs = TicketAuditLog.objects.filter(
                ticket__contact=contact,
                ticket__ticket_type=ticket_type_value
            ).values_list('data', flat=True)

            total_offers = 0
            accepted_offers = 0

            # Count offers and acceptances for this ticket type
            for data in audit_logs:
                if data and 'acceptance' in data:
                    total_offers += 1
                    if data['acceptance'] == 1:
                        accepted_offers += 1

            # Calculate rate for this ticket type
            if total_offers == 0:
                response_data[ticket_type_value] = -1
            else:
                acceptance_percentage = (accepted_offers / total_offers) * 100
                response_data[ticket_type_value] = round(acceptance_percentage, 2)

        return Response(response_data)


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

class TagAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = TagAssignmentSerializer
    queryset = TagAssignments.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        contact_id = self.request.query_params.get("contact")
        if contact_id:
            queryset = queryset.filter(contact_id=contact_id)
        return queryset