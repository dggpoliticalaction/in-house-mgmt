from django.contrib import admin
from .models import Ticket, TicketAuditlog


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'ticket_type', 'ticket_status', 'assigned_to', 'created_at', 'modified_at']
    search_fields = ['id', 'title']  # you can add more like title/description if you have them
    list_filter = ['ticket_type', 'ticket_status', 'created_at']
    ordering = ['-created_at']

    readonly_fields = ['reported_by', 'created_at', 'modified_at']

    def save_model(self, request, obj, form, change):
        # Automatically set reported_by to the logged-in user on create
        if not change and obj.reported_by is None:
            obj.reported_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(TicketAuditlog)
class TicketAuditlogAdmin(admin.ModelAdmin):
    list_display = ['ticket', 'message', 'log_type', 'actor', 'created_at']
    search_fields = ['ticket__id', 'message', 'actor__username']
    list_filter = ['log_type', 'created_at']
    ordering = ['-created_at']

    readonly_fields = ['created_at']
