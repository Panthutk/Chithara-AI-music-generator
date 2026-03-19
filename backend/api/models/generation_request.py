from django.db import models


class GenerationRequest(models.Model):
    class Status(models.TextChoices):
        QUEUED = 'QUEUED', 'Queued'
        RUNNING = 'RUNNING', 'Running'
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'

    requestId = models.AutoField(primary_key=True)
    prompt = models.TextField()
    status = models.CharField(
        max_length=50, choices=Status.choices, default=Status.QUEUED)
    createdAt = models.DateTimeField(auto_now_add=True)

    user = models.ForeignKey(
        'api.User', on_delete=models.CASCADE, related_name='generation_requests')
    track = models.OneToOneField('api.MusicTrack', on_delete=models.CASCADE,
                                 related_name='generation_request', null=True, blank=True)

    class Meta:
        app_label = 'api'

    def __str__(self):
        return f"Request {self.requestId} by {self.user.name}"
