try:
    from djangoappengine.settings_base import *
    has_djangoappengine = True
except ImportError:
    has_djangoappengine = False
    DEBUG = True
    TEMPLATE_DEBUG = DEBUG

import os

SECRET_KEY = 'xxxxx'

INSTALLED_APPS = (
    'djangotoolbox',
#    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'client'
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.csrf.middleware.CsrfMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware'
)


if has_djangoappengine:
    INSTALLED_APPS = ('djangoappengine',) + INSTALLED_APPS

ADMIN_MEDIA_PREFIX = '/media/admin/'
MEDIA_ROOT = os.path.join(os.path.dirname(__file__), 'media')
TEMPLATE_DIRS = (os.path.join(os.path.dirname(__file__), 'templates'),)

ROOT_URLCONF = 'urls'

TWITTER_CONSUMER_KEY = 'xxxxx'
TWITTER_CONSUMER_SECRET = 'xxxxx'

if on_production_server: # Django-nonrel
    DEBUG = False
    TEMPLATE_DEBUG = False

TWITPIC_API_KEY = 'xxxxx'
