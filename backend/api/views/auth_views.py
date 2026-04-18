import jwt
import requests
import datetime
import os
from django.conf import settings
from django.shortcuts import redirect
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from api.models.user import User
from api.serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class GoogleLoginView(APIView):
    def get(self, request):
        client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
        # The exact redirect URI configured in GCP
        redirect_uri = "http://localhost:8000/api/auth/google/callback/"
        
        scope = "openid email profile"
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={client_id}&"
            f"redirect_uri={redirect_uri}&"
            f"response_type=code&"
            f"scope={scope}&"
            f"access_type=offline&"
            f"prompt=select_account"
        )
        return redirect(auth_url)

class GoogleCallbackView(APIView):
    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return Response({"error": "No code provided"}, status=status.HTTP_400_BAD_REQUEST)
            
        client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
        client_secret = os.environ.get("GOOGLE_CLIENT_SECRET", "")
        redirect_uri = "http://localhost:8000/api/auth/google/callback/"
        
        # Exchange code for token
        token_endpoint = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri
        }
        
        token_resp = requests.post(token_endpoint, data=token_data)
        if not token_resp.ok:
            return Response({"error": "Failed to exchange token", "details": token_resp.text}, status=status.HTTP_400_BAD_REQUEST)
            
        access_token = token_resp.json().get('access_token')
        
        # Fetch user info
        userinfo_endpoint = "https://www.googleapis.com/oauth2/v2/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        userinfo_resp = requests.get(userinfo_endpoint, headers=headers)
        
        if not userinfo_resp.ok:
            return Response({"error": "Failed to fetch user info", "details": userinfo_resp.text}, status=status.HTTP_400_BAD_REQUEST)
            
        user_data = userinfo_resp.json()
        email = user_data.get('email')
        name = user_data.get('name', 'User')
        
        # Create or Get User
        user, created = User.objects.get_or_create(
            email=email,
            defaults={'name': name, 'role': 'User'}
        )
        
        # Generate JWT
        jwt_payload = {
            'userId': user.userId,
            'email': user.email,
            'name': user.name,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
            'iat': datetime.datetime.utcnow(),
        }
        
        token = jwt.encode(jwt_payload, settings.SECRET_KEY, algorithm='HS256')
        
        # Redirect to frontend
        frontend_url = f"http://localhost:7999/library?token={token}"
        return redirect(frontend_url)
