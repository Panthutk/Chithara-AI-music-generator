from django.core.management.base import BaseCommand
from api.models.user import User
from api.models.music_library import MusicLibrary
from api.models.music_track import MusicTrack

class Command(BaseCommand):
    help = 'Sets up initial mock data including users, libraries, and sample tracks.'

    def handle(self, *args, **options):
        self.stdout.write("Setting up mock data...")

        # 1. Create Mock Users
        mock_users_data = [
            {'email': 'special1@chitharamock.com', 'name': 'special 1'},
            {'email': 'special2@chitharamock.com', 'name': 'special 2'},
        ]

        for m_data in mock_users_data:
            mock_user, created = User.objects.get_or_create(
                email=m_data['email'],
                defaults={
                    'name': m_data['name'],
                    'role': 'mock_user'
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created mock user: {mock_user.email}"))
            else:
                self.stdout.write(f"Mock user already exists: {mock_user.email}")

            # Ensure Mock User has a Library
            mock_library, lib_created = MusicLibrary.objects.get_or_create(user=mock_user)
            if lib_created:
                self.stdout.write(self.style.SUCCESS(f"Created library for mock user {mock_user.email}."))

        # 2. Create Normal Test User
        normal_user, created = User.objects.get_or_create(
            email='test@example.com',
            defaults={
                'name': 'Test User',
                'role': 'user'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created normal test user: {normal_user.email}"))
        else:
            self.stdout.write(f"Normal user already exists: {normal_user.email}")

        # Ensure Normal User has a Library
        normal_library, lib_created = MusicLibrary.objects.get_or_create(user=normal_user)
        if lib_created:
            self.stdout.write(self.style.SUCCESS(f"Created library for normal test user."))

        # 3. Create Sample Tracks if the database is completely empty of tracks
        if not MusicTrack.objects.exists():
            self.stdout.write("No tracks found, populating some sample tracks...")
            # Create a couple tracks for the normal user so mock users can copy them
            sample_tracks = [
                {
                    'title': 'Neon Dreams',
                    'genre': 'Synthwave',
                    'audio_url': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                    'image_url': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=256&auto=format&fit=crop',
                    'status': MusicTrack.Status.AVAILABLE,
                    'visibility': MusicTrack.Visibility.PUBLIC
                },
                {
                    'title': 'Acoustic Sunrise',
                    'genre': 'Acoustic',
                    'audio_url': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                    'image_url': 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?q=80&w=256&auto=format&fit=crop',
                    'status': MusicTrack.Status.AVAILABLE,
                    'visibility': MusicTrack.Visibility.PUBLIC
                }
            ]

            for track_data in sample_tracks:
                MusicTrack.objects.create(
                    user=normal_user,
                    library=normal_library,
                    **track_data
                )
            self.stdout.write(self.style.SUCCESS(f"Created {len(sample_tracks)} sample tracks."))

        self.stdout.write(self.style.SUCCESS('Mock data setup complete!'))
