from django.contrib import admin
from .models import Person, Group, VolunteerInGroup, GeneralRole, Event, EventParticipant, Tag, AssignedTag, Reach, VolunteerResponse

admin.site.register(Person)
admin.site.register(Group)
admin.site.register(VolunteerInGroup)
admin.site.register(GeneralRole)
admin.site.register(Event)
admin.site.register(EventParticipant)
admin.site.register(Tag)
admin.site.register(AssignedTag)
admin.site.register(Reach)
admin.site.register(VolunteerResponse)
