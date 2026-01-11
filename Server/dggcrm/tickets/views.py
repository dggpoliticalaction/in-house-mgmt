from rest_framework import viewsets, filters
from rest_framework.exceptions import APIException
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from django.db.models import Count, Q, F

from .models import Ticket, TicketStatus, TicketType, TicketAuditlog, TypeTicketLog
from .serializers import TicketSerializer, TicketAuditlogSerializer, TicketCommentSerializer

# TODO: Handle permissions for views in file
class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().order_by('-created_at')
    serializer_class = TicketSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    search_fields = ['id'] # TODO: Add more fields
    ordering_fields = ['priority', 'created_at', 'modified_at', 'ticket_status', 'ticket_type', ]
    ordering = ['priority', '-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()

        q = self.request.query_params.get('q', '').strip()
        status = self.request.query_params.get('status')
        ticket_type = self.request.query_params.get('type')
        priority = self.request.query_params.get('priority')

        if q:
            queryset = queryset.filter(Q(id__icontains=q) | Q(title__icontains=q) | Q(description__icontains=q))

        if status is not None:
            queryset = queryset.filter(ticket_status=status)

        if ticket_type is not None:
            queryset = queryset.filter(ticket_type=ticket_type)

        if priority is not None:
            try:
                priority = int(priority)
            except ValueError:
                raise APIException(
                    detail='Invalid priority in query',
                    code=status.HTTP_400_BAD_REQUEST
                )
            queryset = queryset.filter(priority=priority)

        return queryset

    # TODO: Limit this API to organizer role or above
    @action(detail=False, methods=["get"])
    def group_by_contact(self, request):
        min_date = request.query_params.get("min_date")
        max_date = request.query_params.get("max_date")
        min_tickets = int(request.query_params.get("min_tickets", 0))
        max_tickets = request.query_params.get("max_tickets")

        ticket_status = self.request.query_params.get("status", TicketStatus.COMPLETED)
        ticket_type = request.query_params.get("type")

        qs = (
            Ticket.objects
            .filter(
                contact__isnull=False,
            )
        )

        # Query date ranges
        if min_date:
            qs.filter(created_at__gte=min_date)
        if max_date:
            qs.filter(created_at__lte=max_date)


        if ticket_type:
            qs = qs.filter(ticket_type=type)

        qs = (
            qs.values("contact_id", full_name=F("contact__full_name"))
            .annotate(
                ticket_count=Count(
                    "id",
                    filter=Q(ticket_status=ticket_status),
                )
            )
            .filter(ticket_count__gte=min_tickets)
            .order_by("-ticket_count", "contact_id")
        )

        if max_tickets is not None:
            qs = qs.filter(ticket_count__lte=int(max_tickets))


        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(page)

        return Response(qs)

    @action(detail=True, methods=['post'], url_path='comment', serializer_class=TicketCommentSerializer)
    def comment(self, request, pk=None):
        """
        POST /tickets/<ticket_id>/comment/
        Creates a new comment audit log.
        """
        ticket = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.validated_data['message']

        log = TicketAuditlog.objects.create(
            ticket=ticket,
            message=message,
            actor=request.user if request.user.is_authenticated else None,
            log_type=TypeTicketLog.COMMENT,
        )

        # Return full audit log data
        return Response(TicketAuditlogSerializer(log, context={'request': request}).data, status=status.HTTP_201_CREATED)



    def perform_create(self, serializer):
        """
        Automatically sets reported_by to the current authenticated user.
        """
        user = self.request.user
        serializer.save(reported_by=user if user and user.is_authenticated else None)

class TicketAuditlogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only view for listing audit logs.
    """
    serializer_class = TicketAuditlogSerializer

    def get_queryset(self):
        ticket_id = self.kwargs.get('ticket_id')
        queryset = TicketAuditlog.objects.select_related('actor', 'ticket').all().order_by('-created_at')
        if ticket_id:
            queryset = queryset.filter(ticket_id=ticket_id)
        return queryset
