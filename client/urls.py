from django.conf.urls.defaults import *
from client import views

urlpatterns = patterns('',
                       url(r'^login/?$', views.login),
                       url(r'^logout/?$', views.logout),
                       url(r'^authenticated/?$', views.authenticated),

                       url(r'^main/?$', views.main),

                       url(r'^sign/(?P<url>.+)$', views.sign),
                       url(r'^twitter_api/(?P<url>.+)$', views.twitter_api),
                       url(r'^proxy/(?P<url>.+)$', views.proxy),
                       url(r'^upload$', views.upload),
                       url(r'', views.index)
)
