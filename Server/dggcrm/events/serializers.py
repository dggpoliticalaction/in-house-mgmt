from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(
        source='get_event_status_display',
        read_only=True
    )

    class Meta:
        model = Event
        fields = [
            'id',
            'name',
            'description',
            'event_status',
            'status_display',  # human-readable status
            'created_at',
            'modified_at',
        ]
        read_only_fields = ['id', 'created_at', 'modified_at', 'status_display']
