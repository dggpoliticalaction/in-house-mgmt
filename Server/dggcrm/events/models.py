from django.db import models

# TODO: it might be better to change to TextChoices for enums
class EventStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    SCHEDULED = "scheduled", "Scheduled"
    COMPLETED = "completed", "Completed"
    CANCELED = "canceled", "Canceled"

class Event(models.Model):
    """
    Represents a task that must be accomplished by a user.
    Tasks might be introductions, recruitments, etc.
    They also may track tasks that must be accomplished for events.
    """
    id = models.AutoField(primary_key=True)

    name = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    event_status = models.CharField(
        default=EventStatus.DRAFT,
        choices=EventStatus.choices,
        help_text="Current status of this event"
    )

    # TODO: Fill out more fields from DB diagram

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'events'

    def __str__(self):
        return f"{self.id} ({self.get_status_display()})"
