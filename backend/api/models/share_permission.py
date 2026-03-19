from django.db import models


class SharePermission(models.Model):
    class AccessLevel(models.TextChoices):
        VIEW = 'VIEW', 'View'
        DOWNLOAD = 'DOWNLOAD', 'Download'
        SHARE = 'SHARE', 'Share'

    permissionId = models.AutoField(primary_key=True)
    accessLevel = models.CharField(max_length=50, choices=AccessLevel.choices)
    shareLink = models.URLField(max_length=500, null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    track = models.ForeignKey(
        'api.MusicTrack', on_delete=models.CASCADE, related_name='share_permissions')

    class Meta:
        app_label = 'api'

    def __str__(self):
        return f"{self.accessLevel} for {self.track.title}"
