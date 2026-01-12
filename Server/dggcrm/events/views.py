from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, F

from .models import Event, EventParticipation, UsersInEvent, CommitmentStatus
from .serializers import EventSerializer, EventParticipationSerializer, UsersInEventSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ['name', 'description', 'location_name', 'location_address']
    ordering_fields = ['created_at', 'modified_at', 'event_status']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()

        event_id = self.request.query_params.get("event")
        contact_id = self.request.query_params.get("contact")
        status = self.request.query_params.get("status")

        if event_id:
            queryset = queryset.filter(event_id=event_id)

        if contact_id:
            queryset = queryset.filter(contact_id=contact_id)

        if status:
            queryset = queryset.filter(event_status=status)

        return queryset

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ['name', 'description', 'location_name', 'location_address']
    ordering_fields = ['created_at', 'modified_at', 'event_status']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()

        event_id = self.request.query_params.get("event")
        contact_id = self.request.query_params.get("contact")
        status = self.request.query_params.get("status")

        if event_id:
            queryset = queryset.filter(event_id=event_id)

        if contact_id:
            queryset = queryset.filter(contact_id=contact_id)

        if status:
            queryset = queryset.filter(event_status=status)

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

    def get_queryset(self):
        queryset = super().get_queryset()

        event_id = self.request.query_params.get("event")
        contact_id = self.request.query_params.get("contact")
        status = self.request.query_params.get("status")

        if event_id:
            queryset = queryset.filter(event_id=event_id)

        if contact_id:
            queryset = queryset.filter(contact_id=contact_id)

        if status:
            queryset = queryset.filter(status=status)

        return queryset

    # TODO: Limit this API to organizer role or above
    @action(detail=False, methods=["get"])
    def group_by_contact(self, request):
        min_date = request.query_params.get("min_date")
        max_date = request.query_params.get("max_date")
        min_events = request.query_params.get("min_events", 0)
        max_events = request.query_params.get("max_events")
        status = request.query_params.get("status", CommitmentStatus.ATTENDED)

        qs = EventParticipation.objects.filter(
            status=status,
        )

        # Query date ranges
        if min_date:
            qs.filter(event__ends_at__gte=min_date)
        if max_date:
            qs.filter(event__starts_at__lte=max_date)

        qs = qs.values(
            "contact_id",
            full_name=F("contact__full_name"),
        ).annotate(
            event_count=Count(
                "id",
            )
        )

        qs = (
            qs.filter(event_count__gte=min_events)
                .order_by("-event_count", "contact_id")
        )

        if max_events is not None:
            qs = qs.filter(event_count__lte=max_events)

        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(page)

        return Response(qs)


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

