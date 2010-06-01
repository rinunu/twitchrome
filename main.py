import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

from google.appengine.dist import use_library
use_library('django', '1.1')

import logging

from google.appengine.ext.webapp.util import run_wsgi_app

from django import db
from django.core import signals
import django.core.handlers.wsgi


def log_exception(sender, **kwargs):
    logging.exception('Exception in request:')

signals.got_request_exception.connect(log_exception)
signals.got_request_exception.disconnect(db._rollback_on_exception)


def main():
    application = django.core.handlers.wsgi.WSGIHandler()
    run_wsgi_app(application)


if __name__ == '__main__':
    main()

