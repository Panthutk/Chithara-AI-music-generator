from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from api.models.music_track import MusicTrack
from api.models.track_invite import TrackInvite
from api.models.user import User
from api.serializers import MusicTrackSerializer, TrackInviteSerializer

class ShareTrackView(APIView):
    def patch(self, request, track_id):
        track = get_object_or_404(MusicTrack, pk=track_id)
        user_id = request.data.get('user_id')
        
        # In a real app we'd verify user_id is the track owner. 
        # Since we're keeping it simple and user_id is passed from frontend:
        if track.user_id != user_id:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        visibility = request.data.get('visibility')
        if visibility in ['PUBLIC', 'PRIVATE']:
            track.visibility = visibility
            track.save()
            return Response({'message': f'Visibility updated to {visibility}', 'visibility': visibility})
        
        invite_email = request.data.get('invite_email')
        if invite_email:
            invite_email = invite_email.strip()
            inviter = User.objects.filter(pk=user_id).first()
            if inviter and inviter.email.strip().lower() == invite_email.lower():
                return Response({'error': 'You cannot invite yourself.'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if user with this email exists
            invitee = User.objects.filter(email__iexact=invite_email).first()
            
            # Create the invite
            invite = TrackInvite.objects.create(
                track=track,
                inviter_id=user_id,
                invitee_email=invite_email,
                invitee=invitee,
                status=TrackInvite.Status.PENDING
            )
            return Response({'message': 'Invite sent', 'invite_id': invite.inviteId}, status=status.HTTP_201_CREATED)
            
        return Response({'error': 'Invalid payload. Provide visibility or invite_email.'}, status=status.HTTP_400_BAD_REQUEST)

class PendingInvitesView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        invites = TrackInvite.objects.filter(invitee_id=user_id, status=TrackInvite.Status.PENDING).select_related('inviter', 'track')
        serializer = TrackInviteSerializer(invites, many=True)
        return Response(serializer.data)

class RespondInviteView(APIView):
    def patch(self, request, invite_id):
        invite = get_object_or_404(TrackInvite, pk=invite_id)
        user_id = request.data.get('user_id')
        
        if invite.invitee_id != user_id:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            
        new_status = request.data.get('status')
        if new_status in ['ACCEPTED', 'REJECTED']:
            invite.status = new_status
            invite.save()
            return Response({'message': f'Invite {new_status.lower()}'})
            
        return Response({'error': 'Invalid status. Must be ACCEPTED or REJECTED.'}, status=status.HTTP_400_BAD_REQUEST)

class SharedLibraryView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Get tracks where user has an ACCEPTED invite
        accepted_invites = TrackInvite.objects.filter(invitee_id=user_id, status=TrackInvite.Status.ACCEPTED)
        track_ids = accepted_invites.values_list('track_id', flat=True)
        
        tracks = MusicTrack.objects.filter(trackId__in=track_ids, status=MusicTrack.Status.AVAILABLE)
        serializer = MusicTrackSerializer(tracks, many=True)
        return Response(serializer.data)

class RemoveSharedTrackView(APIView):
    def delete(self, request, track_id):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        deleted, _ = TrackInvite.objects.filter(track_id=track_id, invitee_id=user_id).delete()
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'error': 'Invite not found'}, status=status.HTTP_404_NOT_FOUND)
