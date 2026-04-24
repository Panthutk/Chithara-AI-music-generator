from django.contrib import admin
from .models import User, MusicLibrary, MusicTrack, GenerationRequest, TrackInvite

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('userId', 'name', 'email', 'role')
    search_fields = ('name', 'email')

@admin.register(MusicLibrary)
class MusicLibraryAdmin(admin.ModelAdmin):
    list_display = ('libraryId', 'user', 'createdAt')

@admin.register(MusicTrack)
class MusicTrackAdmin(admin.ModelAdmin):
    list_display = ('trackId', 'title', 'genre', 'status', 'user')
    list_filter = ('genre', 'status')
    search_fields = ('title',)

@admin.register(GenerationRequest)
class GenerationRequestAdmin(admin.ModelAdmin):
    list_display = ('requestId', 'user', 'status', 'createdAt')
    list_filter = ('status',)

@admin.register(TrackInvite)
class TrackInviteAdmin(admin.ModelAdmin):
    list_display = ('inviteId', 'track', 'invitee_email', 'status', 'created_at')

