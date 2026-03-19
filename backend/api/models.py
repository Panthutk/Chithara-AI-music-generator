from django.db import models


class User(models.Model):
    userId = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class MusicLibrary(models.Model):
    libraryId = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='library')
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Library of {self.user.name}"


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
        User, on_delete=models.CASCADE, related_name='tracks')
    library = models.ForeignKey(
        MusicLibrary, on_delete=models.CASCADE, related_name='tracks')

    def __str__(self):
        return self.title


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
        User, on_delete=models.CASCADE, related_name='generation_requests')
    track = models.OneToOneField(MusicTrack, on_delete=models.CASCADE,
                                 related_name='generation_request', null=True, blank=True)

    def __str__(self):
        return f"Request {self.requestId} by {self.user.name}"


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
        MusicTrack, on_delete=models.CASCADE, related_name='share_permissions')

    def __str__(self):
        return f"{self.accessLevel} for {self.track.title}"


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
        SharePermission, on_delete=models.CASCADE, related_name='invitations')

    def __str__(self):
        return f"Invite to {self.email} ({self.status})"


class ListeningActivity(models.Model):
    activityId = models.AutoField(primary_key=True)
    playedAt = models.DateTimeField(auto_now_add=True)
    duration = models.IntegerField(help_text="Duration played in seconds")

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='listening_activities')
    track = models.ForeignKey(
        MusicTrack, on_delete=models.CASCADE, related_name='listening_activities')

    def __str__(self):
        return f"{self.user.name} listened to {self.track.title}"
