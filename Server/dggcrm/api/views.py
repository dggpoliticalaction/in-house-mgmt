from rest_framework.response import Response  # Fix import
from rest_framework.decorators import action, api_view
from rest_framework import viewsets, status
from django.db.models import Q
from dggcrm.base.models import (
    Person, Group, Event, VolunteerInGroup,
    Tag, AssignedTag, EventParticipant,
    Reach, VolunteerResponse, GeneralRole
)
from .serializer import (
    PersonSerializer, PersonWithRelationsSerializer, GroupSerializer,
    EventSerializer, EventWithParticipantsSerializer,
    VolunteerInGroupSerializer, TagSerializer, AssignedTagSerializer,
    EventParticipantSerializer, ReachSerializer, VolunteerResponseSerializer,
    GeneralRoleSerializer
)


@api_view(['GET'])
def is_up(request):
    return Response({"Server": "Up"}, status=200)

class PersonViewSet(viewsets.ModelViewSet):
    paginate_by=10
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

    @action(detail=False, methods=['get'], url_path='with-relations')
    def with_relations(self, request):
        """
        GET /api/people/with-relations/?search=query&group=gid&tag=tid&page=1&page_size=20
        Returns people with their groups and tags, with optional filtering
        """
        # Get query parameters
        search_query = request.query_params.get('search', '')
        group_filter = request.query_params.get('group', '')
        tag_filter = request.query_params.get('tag', '')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        # Start with optimized queryset
        queryset = Person.objects.prefetch_related(
            'volunteeringroup_set__group',
            'assignedtag_set__tag'
        )

        # Apply search filter
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(email__icontains=search_query) |
                Q(did__icontains=search_query) |
                Q(phone__icontains=search_query)
            )

        # Apply group filter
        if group_filter and group_filter != 'all':
            queryset = queryset.filter(
                volunteeringroup__group__gid=group_filter
            ).distinct()

        # Apply tag filter
        if tag_filter and tag_filter != 'all':
            queryset = queryset.filter(
                assignedtag__tag__tid=tag_filter
            ).distinct()

        # Get total count before pagination
        total_count = queryset.count()

        # Apply pagination
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        paginated_queryset = queryset[start_index:end_index]

        # Serialize
        serializer = PersonWithRelationsSerializer(paginated_queryset, many=True)

        # Return with pagination metadata
        return Response({
            'results': serializer.data,
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        })

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
    
    @action(detail=False, methods=['post'], url_path='person-and-tags')
    def groups_and_tags(self, request, pk=None):
        """POST /api/people/person-and-tags/ - Creates or updates a person with tags"""

        data = request.data
        print("data:", data)

        # Get or create the person
        person, created = Person.objects.get_or_create(
            did=data.get('did'),
            defaults={
                'name': data.get('name'),
                'email': data.get('email'),
                'phone': data.get('phone')
            }
        )

        # If person already exists, update their info
        if not created:
            person.name = data.get('name')
            person.email = data.get('email')
            person.phone = data.get('phone')
            person.save()

        # Clear existing tags and add new ones
        AssignedTag.objects.filter(person=person).delete()
        for tagNames in data.get('tags', []):
            tag = Tag.objects.get(name=tagNames)
            newDetail = AssignedTag(person=person, tag=tag)
            newDetail.save()

        return Response(status=204)

    @action(detail=True, methods=['get'], url_path='acceptance-stats')
    def acceptance_stats(self, request, pk=None):
        """
        GET /api/people/{did}/acceptance-stats/
        Returns overall acceptance statistics for a specific person
        """
        person = self.get_object()

        # Get all volunteer responses for this person
        responses = VolunteerResponse.objects.filter(did=person.did)
        print(responses)
        # Calculate overall stats
        total_responses = responses.count()
        if total_responses == 0:
            return Response({
                'person_did': person.did,
                'person_name': person.name,
                'accepted': 0,
                'rejected': 0,
                'total': 0,
                'acceptance_percentage': 0
            })

        accepted_responses = responses.filter(response=1).count()
        rejected_responses = responses.filter(response=0).count()
        acceptance_percentage = (accepted_responses / total_responses * 100) if total_responses > 0 else 0

        return Response({
            'person_did': person.did,
            'person_name': person.name,
            'accepted': accepted_responses,
            'rejected': rejected_responses,
            'total': total_responses,
            'acceptance_percentage': round(acceptance_percentage, 1)
        })


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        print('Groups data:', serializer.data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='with-counts')
    def with_counts(self, request):
        """
        GET /api/groups/with-counts/?page=1&page_size=20
        Returns groups with aggregated member_count and event_count (paginated)
        """
        from django.db.models import Count

        # Get pagination parameters
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        groups = Group.objects.annotate(
            member_count=Count('volunteeringroup', distinct=True),
            event_count=Count('event', distinct=True)
        )

        # Get total count
        total_count = groups.count()

        # Apply pagination
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        paginated_groups = groups[start_index:end_index]

        # Manually serialize to include counts
        data = []
        for group in paginated_groups:
            data.append({
                'gid': group.gid,
                'name': group.name,
                'member_count': group.member_count,
                'event_count': group.event_count
            })

        return Response({
            'results': data,
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        })

    @action(detail=True, methods=['get'], url_path='members')
    def members(self, request, pk=None):
        """
        GET /api/groups/{gid}/members/
        Returns all members of a specific group with their access levels
        """
        group = self.get_object()
        memberships = VolunteerInGroup.objects.filter(group=group).select_related('person')

        # Serialize member data
        data = []
        for membership in memberships:
            data.append({
                'id': membership.id,  # VolunteerInGroup ID for PATCH/DELETE
                'did': membership.person.did,
                'name': membership.person.name,
                'email': membership.person.email,
                'phone': membership.person.phone,
                'access_level': membership.access_level,
                'group': group.gid
            })

        return Response(data)


class VolunteerInGroupViewSet(viewsets.ModelViewSet):
    queryset = VolunteerInGroup.objects.all()
    serializer_class = VolunteerInGroupSerializer


class GeneralRoleViewSet(viewsets.ModelViewSet):
    queryset = GeneralRole.objects.all()
    serializer_class = GeneralRoleSerializer


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    @action(detail=False, methods=['get'], url_path='with-participants')
    def with_participants(self, request):
        """
        GET /api/events/with-participants/?search=query&group=gid&date_filter=upcoming|past|all&page=1&page_size=20
        Returns events with their participants, with optional filtering
        """
        # Get query parameters
        search_query = request.query_params.get('search', '')
        group_filter = request.query_params.get('group', '')
        date_filter = request.query_params.get('date_filter', 'all')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        # Start with optimized queryset
        queryset = Event.objects.select_related('group_id').prefetch_related(
            'eventparticipant_set__person'
        )

        # Apply search filter
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(location__icontains=search_query)
            )

        # Apply group filter
        if group_filter and group_filter != 'all':
            queryset = queryset.filter(group__gid=group_filter)

        # Apply date filter (if date is stored as ISO string, we can do basic comparison)
        # Note: This is simplified - you might want to improve date filtering
        if date_filter == 'upcoming':
            from datetime import datetime
            today = datetime.now().isoformat()
            queryset = queryset.filter(date__gte=today)
        elif date_filter == 'past':
            from datetime import datetime
            today = datetime.now().isoformat()
            queryset = queryset.filter(date__lt=today)

        # Order by date (newest first)
        queryset = queryset.order_by('-date')

        # Get total count before pagination
        total_count = queryset.count()

        # Apply pagination
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        paginated_queryset = queryset[start_index:end_index]

        # Serialize
        serializer = EventWithParticipantsSerializer(paginated_queryset, many=True)

        # Return with pagination metadata
        return Response({
            'results': serializer.data,
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        })


class EventParticipantViewSet(viewsets.ModelViewSet):
    queryset = EventParticipant.objects.all()
    serializer_class = EventParticipantSerializer


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        print('Tags data:', serializer.data)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='aggregate-acceptance-stats')
    def aggregate_acceptance_stats(self, request, pk=None):
        """
        GET /api/tags/{tid}/aggregate-acceptance-stats/
        Returns aggregate acceptance statistics for ALL people with this tag
        """
        tag = self.get_object()

        # Get all people with this tag
        people_with_tag = AssignedTag.objects.filter(tag=tag).values_list('person', flat=True)

        # Get all volunteer responses for these people
        responses = VolunteerResponse.objects.filter(
            did__in=people_with_tag
        ).select_related('rid')

        # Calculate overall stats
        total_responses = responses.count()
        if total_responses == 0:
            return Response({
                'tag_id': tag.tid,
                'tag_name': tag.name,
                'overall': {'accepted': 0, 'total': 0, 'percentage': 0},
                'by_type': []
            })

        accepted_responses = responses.filter(response=1).count()
        overall_percentage = (accepted_responses / total_responses * 100) if total_responses > 0 else 0

        # Calculate stats by reach type
        stats_by_type = {}
        for response in responses:
            reach_type = response.rid.type
            if reach_type not in stats_by_type:
                stats_by_type[reach_type] = {'accepted': 0, 'total': 0}

            stats_by_type[reach_type]['total'] += 1
            if response.response == 1:
                stats_by_type[reach_type]['accepted'] += 1

        # Format by_type stats
        by_type_list = [
            {
                'type': reach_type,
                'accepted': stats['accepted'],
                'total': stats['total'],
                'percentage': (stats['accepted'] / stats['total'] * 100) if stats['total'] > 0 else 0
            }
            for reach_type, stats in stats_by_type.items()
        ]

        return Response({
            'tag_id': tag.tid,
            'tag_name': tag.name,
            'overall': {
                'accepted': accepted_responses,
                'total': total_responses,
                'percentage': round(overall_percentage, 1)
            },
            'by_type': by_type_list
        })



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
