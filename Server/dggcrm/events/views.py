from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import Event, EventParticipation, UsersInEvent
from .serializers import EventSerializer, EventParticipationSerializer, UsersInEventSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'modified_at', 'event_status']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()

        q = self.request.query_params.get('q', '').strip()

        event_id = self.request.query_params.get("event")
        contact_id = self.request.query_params.get("contact")
        status = self.request.query_params.get("status")

        if q:
            queryset = queryset.filter(Q(name__icontains=q) | Q(description__icontains=q))

        if event_id:
            queryset = queryset.filter(event_id=event_id)

        if contact_id:
            queryset = queryset.filter(contact_id=contact_id)

        if status:
            queryset = queryset.filter(status=status)

        return queryset


class EventParticipationViewSet(viewsets.ModelViewSet):
    queryset = (
        EventParticipation.objects
        .select_related("event", "contact")
        .order_by("-created_at")
    )
    serializer_class = EventParticipationSerializer

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "contact__full_name",
        "contact__email",
        "notes",
    ]

    ordering_fields = [
        "created_at",
        "modified_at",
        "status",
    ]

    ordering = ["-created_at"]


class UsersInEventViewSet(viewsets.ModelViewSet):
    queryset = UsersInEvent.objects.select_related(
        "user",
        "event",
    )
    serializer_class = UsersInEventSerializer

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    search_fields = [
        "user__username",
        "event__name",
    ]

    ordering_fields = [
        "joined_at",
    ]

    ordering = ["-joined_at"]

    def get_queryset(self):
        """
        Optional filtering:
        ?event=<event_id>
        ?user=<user_id>
        """
        qs = super().get_queryset()

        event_id = self.request.query_params.get("event")
        user_id = self.request.query_params.get("user")

        if event_id:
            qs = qs.filter(event_id=event_id)

        if user_id:
            qs = qs.filter(user_id=user_id)

        return qs

