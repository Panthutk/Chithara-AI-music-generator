from rest_framework import serializers
from .models.user import User
from .models.music_library import MusicLibrary
from .models.music_track import MusicTrack
from .models.generation_request import GenerationRequest
from .models.track_invite import TrackInvite

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class MusicLibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = MusicLibrary
        fields = '__all__'

class MusicTrackSerializer(serializers.ModelSerializer):
    request_id = serializers.SerializerMethodField()
    prompt = serializers.SerializerMethodField()
    user_name = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = MusicTrack
        fields = '__all__'

    def get_request_id(self, obj):
        if hasattr(obj, 'generation_request'):
            return obj.generation_request.requestId
        return None

    def get_prompt(self, obj):
        if hasattr(obj, 'generation_request'):
            return obj.generation_request.prompt
        return None


class GenerationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenerationRequest
        fields = '__all__'

class TrackInviteSerializer(serializers.ModelSerializer):
    inviter_name = serializers.CharField(source='inviter.name', read_only=True)
    track_title = serializers.CharField(source='track.title', read_only=True)

    class Meta:
        model = TrackInvite
        fields = '__all__'
        read_only_fields = ['status']
