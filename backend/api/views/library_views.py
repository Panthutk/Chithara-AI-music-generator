from rest_framework import viewsets
from api.models.music_library import MusicLibrary
from api.models.music_track import MusicTrack
from api.models.listening_activity import ListeningActivity
from api.models.share_permission import SharePermission
from api.models.email_invitation import EmailInvitation

from api.serializers import (
    MusicLibrarySerializer,
    MusicTrackSerializer,
    ListeningActivitySerializer,
    SharePermissionSerializer,
    EmailInvitationSerializer
)

class MusicLibraryViewSet(viewsets.ModelViewSet):
    queryset = MusicLibrary.objects.all()
    serializer_class = MusicLibrarySerializer

class MusicTrackViewSet(viewsets.ModelViewSet):
    queryset = MusicTrack.objects.all()
    serializer_class = MusicTrackSerializer

class ListeningActivityViewSet(viewsets.ModelViewSet):
    queryset = ListeningActivity.objects.all()
    serializer_class = ListeningActivitySerializer

class SharePermissionViewSet(viewsets.ModelViewSet):
    queryset = SharePermission.objects.all()
    serializer_class = SharePermissionSerializer

class EmailInvitationViewSet(viewsets.ModelViewSet):
    queryset = EmailInvitation.objects.all()
    serializer_class = EmailInvitationSerializer
