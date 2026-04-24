from django.db import models

class TrackInvite(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'
        REMOVED = 'REMOVED', 'Removed'

    inviteId = models.AutoField(primary_key=True)
    track = models.ForeignKey(
        'api.MusicTrack', on_delete=models.CASCADE, related_name='invites')
    inviter = models.ForeignKey(
        'api.User', on_delete=models.CASCADE, related_name='sent_invites')
    invitee_email = models.EmailField()
    invitee = models.ForeignKey(
        'api.User', on_delete=models.CASCADE, related_name='received_invites', null=True, blank=True)
    status = models.CharField(
        max_length=50, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'api'

    def __str__(self):
        return f"Invite to {self.invitee_email} for {self.track.title} ({self.status})"
