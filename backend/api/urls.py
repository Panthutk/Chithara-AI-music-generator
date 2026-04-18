from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    MusicLibraryViewSet,
    MusicTrackViewSet,
    ListeningActivityViewSet,
    GenerationRequestViewSet,
    SharePermissionViewSet,
    EmailInvitationViewSet,
    GenerateMusicView,
    CheckGenerationStatusView,
    GoogleLoginView,
    GoogleCallbackView
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'libraries', MusicLibraryViewSet, basename='library')
router.register(r'tracks', MusicTrackViewSet, basename='track')
router.register(r'listening-activities', ListeningActivityViewSet, basename='listening-activity')
router.register(r'generation-requests', GenerationRequestViewSet, basename='generation-request')
router.register(r'share-permissions', SharePermissionViewSet, basename='share-permission')
router.register(r'email-invitations', EmailInvitationViewSet, basename='email-invitation')

urlpatterns = [
    path('', include(router.urls)),
    path('generate-music/', GenerateMusicView.as_view(), name='generate-music'),
    path('check-generation/', CheckGenerationStatusView.as_view(), name='check-generation'),
    path('auth/google/', GoogleLoginView.as_view(), name='google-login'),
    path('auth/google/callback/', GoogleCallbackView.as_view(), name='google-callback'),
]
