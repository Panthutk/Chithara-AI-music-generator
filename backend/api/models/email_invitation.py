from django.db import models


class EmailInvitation(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SENT = 'SENT', 'Sent'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        EXPIRED = 'EXPIRED', 'Expired'

    invitationId = models.AutoField(primary_key=True)
    email = models.EmailField()
    status = models.CharField(
        max_length=50, choices=Status.choices, default=Status.PENDING)
    sentAt = models.DateTimeField(null=True, blank=True)

    permission = models.ForeignKey(
        'api.SharePermission', on_delete=models.CASCADE, related_name='invitations')

    class Meta:
        app_label = 'api'

    def __str__(self):
        return f"Invite to {self.email} ({self.status})"
