from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import Event
from .serializers import EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-created_at')
    serializer_class = EventSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'modified_at', 'event_status']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """
        GET /api/events/search/?q=keyword&status=1
        Search events by name or description, optionally filter by status.
        """
        queryset = self.get_queryset()

        q = request.query_params.get('q', '').strip()
        status = request.query_params.get('status')

        # Filter by search query
        if q:
            queryset = queryset.filter(Q(name__icontains=q) | Q(description__icontains=q))

        # Filter by status
        if status is not None:
            try:
                queryset = queryset.filter(event_status=status)
            except ValueError:
                return Response({"error": "Invalid status"}, status=400)

        # Paginate if pagination is enabled
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # Fallback
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)