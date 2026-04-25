from abc import ABC, abstractmethod
import os
import urllib.request
import urllib.error
import json
from rest_framework.response import Response
from rest_framework import status
from api.models.generation_request import GenerationRequest
from api.models.music_track import MusicTrack

class GenerationStrategy(ABC):
    @abstractmethod
    def generate(self, gen_request, track, prompt, style, negative, vocal_gender):
        pass

class SunoGenerationStrategy(GenerationStrategy):
    def generate(self, gen_request, track, prompt, style, negative, vocal_gender):
        api_key = os.environ.get('SUNO_API_KEY')
        if not api_key:
            return Response({'error': 'API key not configured on server'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        url = "https://api.sunoapi.org/api/v1/generate"
        payload = {
            "customMode": True,
            "instrumental": vocal_gender == 'none',
            "model": "V4_5ALL",
            "callBackUrl": "https://api.example.com/callback",
            "prompt": prompt,
            "style": style,
            "title": track.title,
            "negativeTags": negative,
            "styleWeight": 0.65,
            "weirdnessConstraint": 0.65,
            "audioWeight": 0.65
        }
        
        if vocal_gender != 'none':
            payload["vocalGender"] = vocal_gender
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode())
                data = result.get('data')
                
                gen_request.status = GenerationRequest.Status.RUNNING
                
                if isinstance(data, str) and data.strip().startswith('{'):
                    import json as json_lib
                    try:
                        data = json_lib.loads(data.replace("'", '"'))
                    except:
                        pass
                        
                if isinstance(data, str) and data.strip() != "" and not data.strip().startswith('{'):
                    gen_request.suno_task_id = data
                elif isinstance(data, dict):
                    gen_request.suno_task_id = data.get('task_id') or data.get('id') or data.get('taskId')
                elif isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
                    gen_request.suno_task_id = data[0].get('id') or data[0].get('task_id') or data[0].get('taskId')
                
                if not gen_request.suno_task_id:
                    gen_request.suno_task_id = result.get('task_id') or result.get('id') or result.get('taskId')
                    
                if not gen_request.suno_task_id and isinstance(data, dict):
                     gen_request.suno_task_id = data.get('taskId') or data.get('id') or str(data)
                
                gen_request.save()
                
                return Response({
                    "message": "Music generation started successfully.",
                    "status": "PROCESSING",
                    "track_id": track.trackId,
                    "request_id": gen_request.requestId,
                    "suno_api_response": result
                }, status=status.HTTP_200_OK)
        except urllib.error.URLError as e:
            gen_request.status = GenerationRequest.Status.FAILED
            gen_request.save()
            track.status = MusicTrack.Status.FAILED
            track.save()
            error_msg = str(e)
            if hasattr(e, 'read'):
                error_msg += ": " + e.read().decode()
            return Response({'error': f'Failed to call generation API: {error_msg}'}, status=status.HTTP_502_BAD_GATEWAY)

class MockGenerationStrategy(GenerationStrategy):
    def generate(self, gen_request, track, prompt, style, negative, vocal_gender):
        # We find a random existing track from ANY user that has an audio_url to copy
        existing_track = MusicTrack.objects.filter(status=MusicTrack.Status.AVAILABLE).exclude(audio_url__isnull=True).exclude(audio_url__exact='').order_by('?').first()
        
        if existing_track:
            track.audio_url = existing_track.audio_url
            track.image_url = existing_track.image_url
            track.status = MusicTrack.Status.AVAILABLE
            track.save()
            
            gen_request.status = GenerationRequest.Status.SUCCESS
            gen_request.save()
            
            return Response({
                "message": "Mock generation completed successfully.",
                "status": "SUCCESS",
                "track_id": track.trackId,
                "request_id": gen_request.requestId,
                "audio_url": track.audio_url,
                "image_url": track.image_url
            }, status=status.HTTP_200_OK)
        else:
            # Fallback if no track exists to copy
            track.audio_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            track.image_url = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=256&auto=format&fit=crop"
            track.status = MusicTrack.Status.AVAILABLE
            track.save()
            
            gen_request.status = GenerationRequest.Status.SUCCESS
            gen_request.save()
            
            return Response({
                "message": "Mock generation completed with fallback audio.",
                "status": "SUCCESS",
                "track_id": track.trackId,
                "request_id": gen_request.requestId,
                "audio_url": track.audio_url,
                "image_url": track.image_url
            }, status=status.HTTP_200_OK)

class GenerationContext:
    def __init__(self, strategy: GenerationStrategy):
        self._strategy = strategy
        
    def execute_generation(self, gen_request, track, prompt, style, negative, vocal_gender):
        return self._strategy.generate(gen_request, track, prompt, style, negative, vocal_gender)
