from django.db import models


class MusicLibrary(models.Model):
    libraryId = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        'api.User', on_delete=models.CASCADE, related_name='library')
    createdAt = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'api'

    def __str__(self):
        return f"Library of {self.user.name}"
