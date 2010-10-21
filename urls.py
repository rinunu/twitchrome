from django.conf.urls.defaults import *
from django.conf import settings

urlpatterns = patterns('',
                       (r'', include('client.urls'))
)

if settings.MEDIA_DEV_MODE:
    from mediagenerator.urls import urlpatterns as mediaurls
    urlpatterns += mediaurls