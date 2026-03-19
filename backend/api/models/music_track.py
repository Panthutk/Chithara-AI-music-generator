from django.db import models


class MusicTrack(models.Model):
    class Genre(models.TextChoices):
        POP = 'POP', 'Pop'
        ROCK = 'ROCK', 'Rock'
        JAZZ = 'JAZZ', 'Jazz'
        HIPHOP = 'HIPHOP', 'Hip Hop'
        CLASSICAL = 'CLASSICAL', 'Classical'
        OTHER = 'OTHER', 'Other'

    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        PROCESSING = 'PROCESSING', 'Processing'
        FAILED = 'FAILED', 'Failed'

    trackId = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    duration = models.IntegerField(
        help_text="Duration in seconds", null=True, blank=True)
    genre = models.CharField(max_length=50, choices=Genre.choices)
    mood = models.CharField(max_length=100)
    occasion = models.CharField(max_length=100)
    status = models.CharField(
        max_length=50, choices=Status.choices, default=Status.PROCESSING)

    user = models.ForeignKey(
        'api.User', on_delete=models.CASCADE, related_name='tracks')
    library = models.ForeignKey(
        'api.MusicLibrary', on_delete=models.CASCADE, related_name='tracks')

    class Meta:
        app_label = 'api'

    def __str__(self):
        return self.title
