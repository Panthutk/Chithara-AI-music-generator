from rest_framework import serializers
from .models.user import User
from .models.music_library import MusicLibrary
from .models.music_track import MusicTrack
from .models.listening_activity import ListeningActivity
from .models.generation_request import GenerationRequest
from .models.share_permission import SharePermission
from .models.email_invitation import EmailInvitation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class MusicLibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = MusicLibrary
        fields = '__all__'

class MusicTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = MusicTrack
        fields = '__all__'

class ListeningActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ListeningActivity
        fields = '__all__'

class GenerationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenerationRequest
        fields = '__all__'

class SharePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SharePermission
        fields = '__all__'

class EmailInvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailInvitation
        fields = '__all__'
