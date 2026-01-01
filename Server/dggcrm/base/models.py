from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator 


class Person(models.Model):
    """
    Represents a person/volunteer in the system.
    Uses Discord ID (did) as the primary key.
    """
    did = models.CharField(max_length=50, primary_key=True, verbose_name="Discord ID")
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'People'
        verbose_name = 'Person'
        verbose_name_plural = 'People'

    def __str__(self):
        return f"{self.name} ({self.did})"


class Group(models.Model):
    """
    Represents a group/team that volunteers can join.
    """
    gid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)

    class Meta:
        db_table = 'Groups'

    def __str__(self):
        return self.name


class VolunteerInGroup(models.Model):
    """
    Many-to-many relationship between volunteers and groups with access levels.
    Access levels: 1 = view, 2 = edit
    """
    person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='did')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, db_column='gid')
    access_level = models.IntegerField()

    ACCESS_VIEW = 1
    ACCESS_EDIT = 2
    ACCESS_CHOICES = [
        (ACCESS_VIEW, 'View'),
        (ACCESS_EDIT, 'Edit'),
    ]

    class Meta:
        db_table = 'VolunteerInGroups'
        unique_together = ('person', 'group')
        verbose_name = 'Volunteer in Group'
        verbose_name_plural = 'Volunteers in Groups'

    def __str__(self):
        return f"{self.person.name} in {self.group.name} (Level {self.access_level})"


class GeneralRole(models.Model):
    """
    General access level for volunteers.
    Access levels: 0 = Needs approval, 1 = Normal organizer, 2 = Admin
    """
    person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='did')
    access_level = models.IntegerField()

    ACCESS_NEEDS_APPROVAL = 0
    ACCESS_ORGANIZER = 1
    ACCESS_ADMIN = 2
    ACCESS_CHOICES = [
        (ACCESS_NEEDS_APPROVAL, 'Needs Approval'),
        (ACCESS_ORGANIZER, 'Normal Organizer'),
        (ACCESS_ADMIN, 'Admin'),
    ]

    class Meta:
        db_table = 'General_Role'
        verbose_name = 'General Role'
        verbose_name_plural = 'General Roles'

    def __str__(self):
        return f"{self.person.name} - Level {self.access_level}"


class Event(models.Model):
    """
    Represents an event organized by a group.
    """
    eid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    date = models.CharField(max_length=255, blank=True, null=True)  # Stored as ISO string
    location = models.TextField(blank=True, null=True)
    group = models.ForeignKey(Group, on_delete=models.CASCADE, db_column='group')

    class Meta:
        db_table = 'Event'
        verbose_name = 'Event'
        verbose_name_plural = 'Events'

    def __str__(self):
        return self.name


class EventParticipant(models.Model):
    """
    Many-to-many relationship between events and participants.
    """
    event = models.ForeignKey(Event, on_delete=models.CASCADE, db_column='eid')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='did')

    class Meta:
        db_table = 'EventParticipants'
        unique_together = ('event', 'person')
        verbose_name = 'Event Participant'
        verbose_name_plural = 'Event Participants'

    def __str__(self):
        return f"{self.person.name} at {self.event.name}"


class Tag(models.Model):
    """
    Tags that can be assigned to volunteers.
    Examples: Dev-Software, Dev-Art, Community Building, Attendance
    """
    tid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        db_table = 'Tags'

    def __str__(self):
        return self.name


class AssignedTag(models.Model):
    """
    Many-to-many relationship between volunteers and tags.
    """
    person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='did')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, db_column='tid')

    class Meta:
        db_table = 'AssignedTags'
        unique_together = ('person', 'tag')
        verbose_name = 'Assigned Tag'
        verbose_name_plural = 'Assigned Tags'

    def __str__(self):
        return f"{self.person.name} - {self.tag.name}"


class Reach(models.Model):
    """
    Represents outreach tasks/requests.
    Types: asset, sof_dev, ally-reach
    """
    rid = models.AutoField(primary_key=True)
    status = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)])
    assigned = models.ForeignKey(Person, on_delete=models.SET_NULL, null=True, blank=True, db_column='assigned')
    title = models.CharField(max_length=255)
    description = models.TextField()
    type = models.CharField(max_length=50)
    priority = models.IntegerField()

    ##TO_DO BEFORE PROD DE_HARDCODE TYPE 
    TYPE_ASSET = 'asset'
    TYPE_SOF_DEV = 'sof_dev'
    TYPE_ALLY_REACH = 'ally-reach'
    TYPE_CHOICES = [
        (TYPE_ASSET, 'Asset'),
        (TYPE_SOF_DEV, 'Software Development'),
        (TYPE_ALLY_REACH, 'Ally Reach'),
    ]

    class Meta:
        db_table = 'Reaches'
        verbose_name = 'Reach'
        verbose_name_plural = 'Reaches'

    def __str__(self):
        return self.title


class VolunteerResponse(models.Model):
    """
    Tracks volunteer responses to reaches.
    Response: 1 = accepted, 2 = rejected
    """
    reach = models.ForeignKey(Reach, on_delete=models.CASCADE, db_column='rid')
    person = models.ForeignKey(Person, on_delete=models.CASCADE, db_column='did')
    response = models.IntegerField()

    RESPONSE_ACCEPTED = 1
    RESPONSE_REJECTED = 2
    RESPONSE_CHOICES = [
        (RESPONSE_ACCEPTED, 'Accepted'),
        (RESPONSE_REJECTED, 'Rejected'),
    ]

    class Meta:
        db_table = 'VolunteerResponses'
        verbose_name = 'Volunteer Response'
        verbose_name_plural = 'Volunteer Responses'

    def __str__(self):
        return f"{self.person.name} - {self.reach.title} ({'Accepted' if self.response == 1 else 'Rejected'})"
