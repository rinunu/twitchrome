from django.conf.urls.defaults import *
from client import views

urlpatterns = patterns('',
                       url(r'^login/?$', views.login),
                       url(r'^logout/?$', views.logout),
                       url(r'^authenticated/?$', views.authenticated),

                       url(r'^main/?$', views.main),

                       url(r'^user.json$', views.user),

                       url(r'^twitter_api/(?P<url>.+)$', views.twitter_api),
                       url(r'', views.index)
)
