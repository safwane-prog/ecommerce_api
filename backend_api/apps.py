from django.apps import AppConfig


class BackendApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend_api'
    def ready(self):
        import backend_api.signals
