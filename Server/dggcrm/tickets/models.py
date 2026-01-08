from django.db import models
from django.conf import settings

class TicketStatus(models.TextChoices):
    OPEN = "OPEN", "Open"
    TODO = "TODO", "To Do"
    INPROGRESS = "IN_PROGRESS", "In Progress"
    BLOCKED = "BLOCKED", "Blocked"
    COMPLETED = "COMPLETED", "Completed"
    CANCELED = "CANCELED", "Canceled"

# TODO: Should we convert to table? 
class TicketType(models.TextChoices):
    UNKNOWN = "UNKNOWN", "Unknown"
    INTRODUCTION = "INTRODUCTION", "Introduction"
    RECRUIT = "RECRUIT", "Recruit for event"
    CONFIRM = "CONFIRM", "Confirm event participation"
    # TODO: What other types do we want?

class Ticket(models.Model):
    """
    Represents a task that must be accomplished by a user.
    Tasks might be introductions, recruitments, etc.
    They also may track tasks that must be accomplished for events.
    """
    id = models.AutoField(primary_key=True)
    ticket_status = models.CharField(
        default=TicketStatus.OPEN,
        choices=TicketStatus.choices,
        help_text="Current status of this ticket."
    )
    ticket_type = models.CharField(
        default=TicketType.UNKNOWN,
        choices=TicketType.choices,
        help_text="Type for this ticket"
    )

    # TODO: Fill out more fields from DB diagram

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tickets'

    def __str__(self):
        return f"{self.id} ({self.get_ticket_status_display()})"


class TypeTicketLog(models.TextChoices):
    CREATED = "CREATED", "Ticket created"
    UPDATED = "UPDATED", "Ticket updated"
    CLAIMED = "CLAIM", "Ticket claimed"
    UNCLAIMED = "UNCLAIMED", "Ticket unclaimed"
    STATUS_CHANGED = "STATUS", "Ticket status changed"
    CONTACT_RESPONSE = "CONTACT_RESPONSE", "Contact responded"
    COMMENT = "COMMENT", "New comment"


class TicketAuditlog(models.Model):
    id = models.AutoField(primary_key=True)

    ticket = models.ForeignKey(
        "tickets.Ticket",
        on_delete=models.CASCADE,
        related_name="ticket_logs",
    )

    log_type = models.CharField(
        choices=TypeTicketLog,
        help_text="Type of event in ticket audit log"
    )

    message = models.TextField()

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ticket_logs_user",
        help_text="User that created this entry (NULL means system)",
    )

    data = models.JSONField(
        blank=True,
        default=dict,
        help_text="Optional structured context",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ticket_audit_logs'
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.id} ({self.event_type})"

# TODO: implement missing tables from DB diagram