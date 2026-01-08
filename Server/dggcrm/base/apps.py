from django.apps import AppConfig

# TODO: Remove this app
class BaseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dggcrm.base'
