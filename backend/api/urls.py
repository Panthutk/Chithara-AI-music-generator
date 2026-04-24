from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    MusicLibraryViewSet,
    MusicTrackViewSet,
    ListeningActivityViewSet,
    GenerationRequestViewSet,
    GenerateMusicView,
    CheckGenerationStatusView,
    GoogleLoginView,
    GoogleCallbackView,
    ShareTrackView,
    PendingInvitesView,
    RespondInviteView,
    SharedLibraryView,
    RemoveSharedTrackView
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'libraries', MusicLibraryViewSet, basename='library')
router.register(r'tracks', MusicTrackViewSet, basename='track')
router.register(r'listening-activities', ListeningActivityViewSet, basename='listening-activity')
router.register(r'generation-requests', GenerationRequestViewSet, basename='generation-request')

urlpatterns = [
    path('generate-music/', GenerateMusicView.as_view(), name='generate-music'),
    path('check-generation/', CheckGenerationStatusView.as_view(), name='check-generation'),
    path('auth/google/', GoogleLoginView.as_view(), name='google-login'),
    path('auth/google/callback/', GoogleCallbackView.as_view(), name='google-callback'),
    path('tracks/<int:track_id>/share/', ShareTrackView.as_view(), name='share-track'),
    path('invites/pending/', PendingInvitesView.as_view(), name='pending-invites'),
    path('invites/<int:invite_id>/respond/', RespondInviteView.as_view(), name='respond-invite'),
    path('tracks/shared/', SharedLibraryView.as_view(), name='shared-library'),
    path('tracks/<int:track_id>/shared/', RemoveSharedTrackView.as_view(), name='remove-shared-track'),
    path('', include(router.urls)),
]
