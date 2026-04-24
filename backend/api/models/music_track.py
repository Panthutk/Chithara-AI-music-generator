from django.db import models


class MusicTrack(models.Model):


    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        PROCESSING = 'PROCESSING', 'Processing'
        FAILED = 'FAILED', 'Failed'
        HIDDEN = 'HIDDEN', 'Hidden'

    class Visibility(models.TextChoices):
        PRIVATE = 'PRIVATE', 'Private'
        PUBLIC = 'PUBLIC', 'Public'

    trackId = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    genre = models.CharField(max_length=255)
    status = models.CharField(
        max_length=50, choices=Status.choices, default=Status.PROCESSING)
    visibility = models.CharField(
        max_length=50, choices=Visibility.choices, default=Visibility.PRIVATE)
    audio_url = models.URLField(max_length=1000, null=True, blank=True)
    image_url = models.URLField(max_length=1000, null=True, blank=True)

    user = models.ForeignKey(
        'api.User', on_delete=models.CASCADE, related_name='tracks')
    library = models.ForeignKey(
        'api.MusicLibrary', on_delete=models.CASCADE, related_name='tracks')

    class Meta:
        app_label = 'api'

    def __str__(self):
        return self.title
