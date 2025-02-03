from django.apps import AppConfig



class UserAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user_app'

    def ready(self):
        import sys
        if 'test' not in sys.argv:
            import user_app.signals