from rest_framework import viewsets
from .models.user import User
from .models.music_library import MusicLibrary
from .models.music_track import MusicTrack
from .models.listening_activity import ListeningActivity
from .models.generation_request import GenerationRequest
from .models.share_permission import SharePermission
from .models.email_invitation import EmailInvitation

from .serializers import (
    UserSerializer,
    MusicLibrarySerializer,
    MusicTrackSerializer,
    ListeningActivitySerializer,
    GenerationRequestSerializer,
    SharePermissionSerializer,
    EmailInvitationSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class MusicLibraryViewSet(viewsets.ModelViewSet):
    queryset = MusicLibrary.objects.all()
    serializer_class = MusicLibrarySerializer

class MusicTrackViewSet(viewsets.ModelViewSet):
    queryset = MusicTrack.objects.all()
    serializer_class = MusicTrackSerializer

class ListeningActivityViewSet(viewsets.ModelViewSet):
    queryset = ListeningActivity.objects.all()
    serializer_class = ListeningActivitySerializer

class GenerationRequestViewSet(viewsets.ModelViewSet):
    queryset = GenerationRequest.objects.all()
    serializer_class = GenerationRequestSerializer

class SharePermissionViewSet(viewsets.ModelViewSet):
    queryset = SharePermission.objects.all()
    serializer_class = SharePermissionSerializer

class EmailInvitationViewSet(viewsets.ModelViewSet):
    queryset = EmailInvitation.objects.all()
    serializer_class = EmailInvitationSerializer
