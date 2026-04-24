from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    MusicLibraryViewSet,
    MusicTrackViewSet,
    GenerationRequestViewSet,
    GenerateMusicView,
    CheckGenerationStatusView,
    GoogleLoginView,
    GoogleCallbackView,
    VerifySessionView,
    ShareTrackView,
    PendingInvitesView,
    RespondInviteView,
    SharedLibraryView,
    RemoveSharedTrackView,
    TrackInviteViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'libraries', MusicLibraryViewSet, basename='library')
router.register(r'tracks', MusicTrackViewSet, basename='track')
router.register(r'generation-requests', GenerationRequestViewSet, basename='generation-request')
router.register(r'track-invites', TrackInviteViewSet, basename='track-invite')

urlpatterns = [
    path('generate-music/', GenerateMusicView.as_view(), name='generate-music'),
    path('check-generation/', CheckGenerationStatusView.as_view(), name='check-generation'),
    path('auth/google/', GoogleLoginView.as_view(), name='google-login'),
    path('auth/google/callback/', GoogleCallbackView.as_view(), name='google-callback'),
    path('auth/verify-session/', VerifySessionView.as_view(), name='verify-session'),
    path('tracks/<int:track_id>/share/', ShareTrackView.as_view(), name='share-track'),
    path('invites/pending/', PendingInvitesView.as_view(), name='pending-invites'),
    path('invites/<int:invite_id>/respond/', RespondInviteView.as_view(), name='respond-invite'),
    path('tracks/shared/', SharedLibraryView.as_view(), name='shared-library'),
    path('tracks/<int:track_id>/shared/', RemoveSharedTrackView.as_view(), name='remove-shared-track'),
    path('', include(router.urls)),
]
