import os
import urllib.request
import urllib.error
import json
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from api.models.user import User
from api.models.music_library import MusicLibrary
from api.models.music_track import MusicTrack
from api.models.generation_request import GenerationRequest
from api.serializers import GenerationRequestSerializer
from django.utils import timezone
import datetime
from api.strategies.generation_strategy import GenerationContext, SunoGenerationStrategy, MockGenerationStrategy

# Simple .env loader
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                key, val = line.strip().split('=', 1)
                os.environ[key.strip()] = val.strip().strip('"').strip("'")

class GenerateMusicView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
        # Get or create library for user
        library, created = MusicLibrary.objects.get_or_create(user=user)

        # Enforce weekly quota (max 30 requests per 7 days)
        week_ago = timezone.now() - datetime.timedelta(days=7)
        recent_requests_count = GenerationRequest.objects.filter(user=user, createdAt__gte=week_ago).count()
        if recent_requests_count >= 30:
            return Response({'error': f'Weekly quota exceeded. You have generated {recent_requests_count} tracks in the last 7 days. Maximum allowed is 30.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        prompt = request.data.get('prompt', 'A calm and relaxing piano track')
        title = request.data.get('title', 'Generated Track')
        style = request.data.get('style', 'Classical')
        negative = request.data.get('negative', 'none')
        vocal_gender = request.data.get('vocalGender', 'm')
        
        # Create a generation request record
        gen_request = GenerationRequest.objects.create(
            prompt=prompt,
            title=title,
            style=style,
            negativeTags=negative,
            vocalGender=vocal_gender,
            status=GenerationRequest.Status.QUEUED,
            user=user
        )
        
        # Create a music track in processing state
        track = MusicTrack.objects.create(
            title=title,
            genre=style[:255],
            status=MusicTrack.Status.PROCESSING,
            user=user,
            library=library
        )
        
        # Link track to the request
        gen_request.track = track
        gen_request.save()
        
        # Choose strategy
        if user.role == 'MOCK_USER':
            strategy = MockGenerationStrategy()
        else:
            strategy = SunoGenerationStrategy()
            
        context = GenerationContext(strategy)
        return context.execute_generation(gen_request, track, prompt, style, negative, vocal_gender)

class CheckGenerationStatusView(APIView):
    def get(self, request):
        request_id = request.query_params.get('request_id')
        if not request_id:
            return Response({'error': 'request_id missing in query mapping'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            gen_request = GenerationRequest.objects.get(pk=request_id)
        except GenerationRequest.DoesNotExist:
            return Response({'error': 'Generation request not found'}, status=status.HTTP_404_NOT_FOUND)
            
        if gen_request.status == GenerationRequest.Status.SUCCESS:
            return Response({
                'status': 'SUCCESS', 
                'audio_url': gen_request.track.audio_url if gen_request.track else None,
                'image_url': gen_request.track.image_url if gen_request.track else None
            })
            
        if not gen_request.suno_task_id:
            return Response({'status': gen_request.status, 'error': 'No Suno Task ID tracked.'})
            
        api_key = os.environ.get('SUNO_API_KEY')
        url = f"https://api.sunoapi.org/api/v1/generate/record-info?taskId={gen_request.suno_task_id}"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "Mozilla/5.0"
        }
        
        req = urllib.request.Request(url, headers=headers, method='GET')
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode())
                data = result.get('data')
                
                if data and isinstance(data, dict):
                    # API returns status like "SUCCESS", "PENDING", "FAILED"
                    suno_status = data.get('status')
                    
                    if suno_status == 'SUCCESS':
                        gen_request.status = GenerationRequest.Status.SUCCESS
                        gen_request.save()
                        
                        suno_data_list = data.get('response', {}).get('sunoData', [])
                        if suno_data_list and len(suno_data_list) > 0:
                            # Usually generates 2 tracks, we grab the first one for this basic MVP
                            track_info = suno_data_list[0]
                            audio_url = track_info.get('audioUrl') or track_info.get('sourceAudioUrl')
                            image_url = track_info.get('imageUrl') or track_info.get('sourceImageUrl')

                            if gen_request.track:
                                gen_request.track.audio_url = audio_url
                                gen_request.track.image_url = image_url
                                gen_request.track.status = MusicTrack.Status.AVAILABLE
                                gen_request.track.save()
                                
                            return Response({
                                'status': 'SUCCESS',
                                'audio_url': audio_url,
                                'image_url': image_url,
                                'track_id': gen_request.track.trackId if gen_request.track else None
                            })
                    
                    elif suno_status == 'FAILED' or suno_status == 'CREATE_TASK_FAILED' or suno_status == 'GENERATE_AUDIO_FAILED':
                        gen_request.status = GenerationRequest.Status.FAILED
                        gen_request.save()
                        if gen_request.track:
                            gen_request.track.status = MusicTrack.Status.FAILED
                            gen_request.track.save()
                        return Response({'status': 'FAILED'})
                        
                return Response({'status': 'PROCESSING', 'raw_suno_status': data.get('status') if isinstance(data, dict) else None})
                
        except urllib.error.URLError as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

class GenerationRequestViewSet(viewsets.ModelViewSet):
    queryset = GenerationRequest.objects.all()
    serializer_class = GenerationRequestSerializer

class UserQuotaView(APIView):
    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
        week_ago = timezone.now() - datetime.timedelta(days=7)
        recent_requests_count = GenerationRequest.objects.filter(user=user, createdAt__gte=week_ago).count()
        remaining = max(0, 30 - recent_requests_count)
        
        return Response({
            'total_limit': 30,
            'used': recent_requests_count,
            'remaining': remaining
        })
