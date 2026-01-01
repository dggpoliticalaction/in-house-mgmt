from rest_framework import serializers
from base.models import Person, Group, Event, VolunteerInGroup, Tag, AssignedTag, EventParticipant, Reach, VolunteerResponse, GeneralRole

class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = '__all__'

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class VolunteerInGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerInGroup
        fields = '__all__'

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'

class AssignedTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignedTag
        fields = '__all__'

class EventParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventParticipant
        fields = '__all__'

class ReachSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reach
        fields = '__all__'

class VolunteerResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerResponse
        fields = '__all__'

class GeneralRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = GeneralRole
        fields = '__all__'
