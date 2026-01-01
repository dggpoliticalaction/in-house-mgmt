from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'people', views.PersonViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'volunteers-in-groups', views.VolunteerInGroupViewSet)
router.register(r'general-roles', views.GeneralRoleViewSet)
router.register(r'events', views.EventViewSet)
router.register(r'event-participants', views.EventParticipantViewSet)
router.register(r'tags', views.TagViewSet)
router.register(r'assigned-tags', views.AssignedTagViewSet)
router.register(r'reaches', views.ReachViewSet)
router.register(r'volunteer-responses', views.VolunteerResponseViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
