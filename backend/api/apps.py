from django.apps import AppConfig
import sys
import os
import warnings

class ApiConfig(AppConfig):
    name = 'api'

    def ready(self):
        # Only run these commands if 'runserver' is the actual command being executed
        if 'runserver' in sys.argv:
            # Prevent running twice due to Django's autoreloader
            if os.environ.get('RUN_MAIN') != 'true':
                from django.core.management import call_command
                try:
                    with warnings.catch_warnings():
                        warnings.simplefilter("ignore")
                        print("Running auto-migrations...")
                        call_command('migrate', interactive=False)
                        print("Running mock data setup...")
                        call_command('setup_mock_data')
                except Exception as e:
                    print(f"Failed to run startup scripts: {e}")
