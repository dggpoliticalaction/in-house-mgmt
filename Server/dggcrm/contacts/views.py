from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.db.models import Q

from .models import Contact, Tag, TagAssignments
from .serializers import (
    ContactSerializer,
    TagSerializer,
    TagAssignmentSerializer,
)

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