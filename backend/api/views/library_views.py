from rest_framework import viewsets
from api.models.music_library import MusicLibrary
from api.models.music_track import MusicTrack

from api.serializers import (
    MusicLibrarySerializer,
    MusicTrackSerializer
)

class MusicLibraryViewSet(viewsets.ModelViewSet):
    queryset = MusicLibrary.objects.all()
    serializer_class = MusicLibrarySerializer

class MusicTrackViewSet(viewsets.ModelViewSet):
    queryset = MusicTrack.objects.all()
    serializer_class = MusicTrackSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        # Exclude logically deleted tracks
        queryset = queryset.exclude(status=MusicTrack.Status.HIDDEN)
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset



