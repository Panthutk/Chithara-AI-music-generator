from django.db import models


class User(models.Model):
    userId = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50)

    class Meta:
        app_label = 'api'

    def __str__(self):
        return self.name
