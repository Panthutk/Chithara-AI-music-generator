from django.db import models


class ListeningActivity(models.Model):
    activityId = models.AutoField(primary_key=True)
    playedAt = models.DateTimeField(auto_now_add=True)
    duration = models.IntegerField(help_text="Duration played in seconds")

    user = models.ForeignKey(
        'api.User', on_delete=models.CASCADE, related_name='listening_activities')
    track = models.ForeignKey(
        'api.MusicTrack', on_delete=models.CASCADE, related_name='listening_activities')

    class Meta:
        app_label = 'api'

    def __str__(self):
        return f"{self.user.name} listened to {self.track.title}"
