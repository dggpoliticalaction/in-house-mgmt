from rest_framework import viewsets
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

    # TODO: Update search api to properly handle permissions,
    #   access, and search all fields
    def get_queryset(self):
        queryset = super().get_queryset()

        query = self.request.query_params.get("q", "").strip()
        tag = self.request.query_params.get("tag")
        
        # TODO add querying by event participation

        if query:
            queryset = queryset.filter(
                Q(full_name__icontains=query) |
                Q(email__icontains=query) |
                Q(discord_id__icontains=query) |
                Q(phone__icontains=query) |
                Q(note__icontains=query)
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