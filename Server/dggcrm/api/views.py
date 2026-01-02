from rest_framework.response import Response  # Fix import
from rest_framework.decorators import action
from rest_framework import viewsets, status
from django.db.models import Q
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

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """GET /api/people/search/?q=search_term"""
        query = request.query_params.get('q', '')
        if query:
            people = Person.objects.filter(
                Q(name__icontains=query) |
                Q(email__icontains=query) |
                Q(did__icontains=query)
            )
        else:
            people = Person.objects.all()

        serializer = PersonSerializer(people[:20], many=True)  # Limit to 20 results
        return Response(serializer.data)


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

    @action(detail=True, methods=['patch'], url_path='assign')
    def assign_to_user(self, request, pk=None):
        """
        PATCH /api/reaches/{id}/assign/
        Body: { "assigned": person_did }
        Assigns a reach to a person
        """
        reach = self.get_object()
        assigned_did = request.data.get('assigned')

        if not assigned_did:
            return Response(
                {"detail": "assigned field is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        reach.assigned = assigned_did
        reach.save()
        serializer = ReachSerializer(reach)
        return Response(serializer.data)

class VolunteerResponseViewSet(viewsets.ModelViewSet):
    queryset = VolunteerResponse.objects.all()
    serializer_class = VolunteerResponseSerializer

    # Disable detail routes since we're using composite key

    @action(detail=False, methods=['get'], url_path='by-reach/(?P<reach_id>[^/.]+)')
    def get_responses_by_reach(self, request, reach_id=None):
        """GET /api/volunteer-responses/by-reach/{reach_id}/"""
        responses = VolunteerResponse.objects.filter(rid=reach_id)
        serializer = VolunteerResponseSerializer(responses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], url_path='update-by-keys')
    def update_by_keys(self, request):
        """
        PATCH /api/volunteer-responses/update-by-keys/
        Body: { "rid": reach_id, "did": person_did, "response": 1 or 0 }
        Updates a volunteer response using composite key (rid + did)
        """
        rid = request.data.get('rid')
        did = request.data.get('did')
        response_value = request.data.get('response')

        if rid is None or did is None or response_value is None:
            return Response(
                {"detail": "rid, did, and response are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            volunteer_response = VolunteerResponse.objects.get(rid=rid, did=did)
            volunteer_response.response = response_value
            volunteer_response.save()
            serializer = VolunteerResponseSerializer(volunteer_response)
            return Response(serializer.data)
        except VolunteerResponse.DoesNotExist:
            return Response(
                {"detail": "VolunteerResponse not found with the given rid and did"},
                status=status.HTTP_404_NOT_FOUND
            )
