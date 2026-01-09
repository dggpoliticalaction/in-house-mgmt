from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Ticket, TicketAuditlog, TicketStatus, TicketType

User = get_user_model()

class TicketSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(
        source='get_ticket_status_display',
        read_only=True
    )
    type_display = serializers.CharField(
        source='get_ticket_type_display',
        read_only=True
    )
    assigned_to_username = serializers.CharField(
        source='assigned_to.username',
        read_only=True
    )
    reported_by_username = serializers.CharField(
        source='reported_by.username',
        read_only=True
    )
    priority_display = serializers.CharField(
        source='get_priority_display',
        read_only=True
    )

    class Meta:
        model = Ticket
        fields = "__all__"
        read_only_fields = ['id', 'created_at', 'modified_at', 'status_display', 'type_display', 'assigned_to_username', 'reported_by_username', 'priority_display', 'reported_by']


class TicketAuditlogSerializer(serializers.ModelSerializer):
    log_display = serializers.CharField(
        source='get_log_type_display',
        read_only=True
    )
    actor_username = serializers.CharField(
        source='actor.username',
        read_only=True
    )

    class Meta:
        model = TicketAuditlog
        fields = [
            'id',
            'ticket',
            'log_type',
            'log_display',
            'message',
            'actor',
            'actor_username',
            'data',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'log_type', 'log_display', 'actor', 'actor_username']

class TicketCommentSerializer(serializers.Serializer):
    message = serializers.CharField()