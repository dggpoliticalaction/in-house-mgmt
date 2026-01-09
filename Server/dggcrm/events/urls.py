from rest_framework.routers import DefaultRouter
from .views import EventViewSet, EventParticipationViewSet

router = DefaultRouter()
router.register("events", EventViewSet, basename="event")
router.register(
    "participants",
    EventParticipationViewSet,
    basename="participant",
)


urlpatterns = router.urls