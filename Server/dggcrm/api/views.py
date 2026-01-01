from rest_framework.response import Response  # Fix import
from rest_framework.decorators import action
from rest_framework import viewsets
from base.models import (
    Person, Group, Event, VolunteerInGroup,
    Tag, AssignedTag, EventParticipant,
    Reach, VolunteerResponse, GeneralRole
)
from .serializer import (
    PersonSerializer, GroupSerializer, EventSerializer,
    VolunteerInGroupSerializer, TagSerializer, AssignedTagSerializer,
    EventParticipantSerializer, ReachSerializer, VolunteerResponseSerializer,
    GeneralRoleSerializer
)


class PersonViewSet(viewsets.ModelViewSet):
    paginate_by=10
    queryset = Person.objects.all()
    serializer_class = PersonSerializer


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


class VolunteerInGroupViewSet(viewsets.ModelViewSet):
    queryset = VolunteerInGroup.objects.all()
    serializer_class = VolunteerInGroupSerializer


class GeneralRoleViewSet(viewsets.ModelViewSet):
    queryset = GeneralRole.objects.all()
    serializer_class = GeneralRoleSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer


class EventParticipantViewSet(viewsets.ModelViewSet):
    queryset = EventParticipant.objects.all()
    serializer_class = EventParticipantSerializer


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class AssignedTagViewSet(viewsets.ModelViewSet):
    queryset = AssignedTag.objects.all()
    serializer_class = AssignedTagSerializer


class ReachViewSet(viewsets.ModelViewSet):
    queryset = Reach.objects.all()
    serializer_class = ReachSerializer


    @action(detail=False, methods=['get'], url_path='priority')
    def get_reaches_priority(self, request):
        reaches = Reach.objects.all().order_by('-priority')
        serializer = ReachSerializer(reaches, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-type/(?P<rtype>[^/.]+)')
    def get_reaches_by_type(self, request, rtype=None):
        """GET /api/reaches/by-type/{rtype}/"""
        if rtype and rtype.lower() in [choice[0].lower() for choice in Reach.TYPE_CHOICES]:
            reaches = Reach.objects.filter(type=rtype).order_by('-priority')
            serializer = ReachSerializer(reaches, many=True)
            return Response(serializer.data)
        else:
            return Response({"detail": "Invalid reach type"}, status=400)

    @action(detail=False, methods=['get'], url_path='by-status/(?P<stat>[^/.]+)')
    def get_reaches_by_status(self, request, stat=0):
        """GET /api/reaches/by-status/{status}"""
        if int(stat) in [0, 1, 2, 3, 4]:
            reaches = Reach.objects.filter(status=stat).order_by('-priority')
            serializer = ReachSerializer(reaches, many=True)
            return Response(serializer.data)
        else:
            return Response({"detail": "Invalid status"}, status=400)

class VolunteerResponseViewSet(viewsets.ModelViewSet):
    queryset = VolunteerResponse.objects.all()
    serializer_class = VolunteerResponseSerializer
