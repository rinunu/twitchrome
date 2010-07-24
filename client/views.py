# -*- coding: utf-8 -*- 

import time
import cgi
import logging
import urllib
import cgi

from django.shortcuts import render_to_response
from django.conf import settings
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.http import HttpResponseForbidden
from django.core.urlresolvers import reverse
from django.views.generic.simple import direct_to_template

import oauth
from google.appengine.api import urlfetch

from poster.encode import multipart_encode

request_token_url = 'http://twitter.com/oauth/request_token'
authenticate_url = 'http://twitter.com/oauth/authorize'
access_token_url = 'http://twitter.com/oauth/access_token'

consumer = oauth.OAuthConsumer(settings.TWITTER_CONSUMER_KEY, settings.TWITTER_CONSUMER_SECRET)
signature_method = oauth.OAuthSignatureMethod_HMAC_SHA1()

logger = logging.getLogger("views")

def fetch(url, method, payload = None, headers = {}):
    response = urlfetch.fetch(url, method=method, payload=payload, deadline=10, headers=headers)
    return response.status_code, response.content

# oauth を使用してデータを取得する
def fetch_oauth(url, parameters, method, token, headers = {}):
    req = oauth.OAuthRequest.from_consumer_and_token(
        consumer,
        token,
        http_method=method,
        http_url=url,
        parameters=parameters
        )
    
    req.sign_request(signature_method, consumer, token)

    if method == 'GET':
        return fetch(url=req.to_url(), method=method, headers=headers)
    else:
        return fetch(url=url, method=method, payload=req.to_postdata(), headers=headers)

# ------------------------------------------------------------

def login(request):
    # get request token
    oauth_request = oauth.OAuthRequest.from_consumer_and_token(
        consumer, http_url=request_token_url, callback=request.build_absolute_uri("authenticated"))
    oauth_request.sign_request(signature_method, consumer, None)
    status, content = fetch(method=oauth_request.http_method, url=oauth_request.to_url())
    if status != 200:
        raise Exception("Invalid response from Twitter.", status, content)
    token = oauth.OAuthToken.from_string(content)

    # to session
    request.session['request_token'] = token

    # redirect
    oauth_request = oauth.OAuthRequest.from_token_and_callback(token=token, http_url=authenticate_url)
    return HttpResponseRedirect(oauth_request.to_url())

def logout(request):
    request.session.clear()
    return HttpResponseRedirect('/')

# リクエストトークンを認可された
def authenticated(request):
    token = request.session['request_token']

    # get access token
    oauth_request = oauth.OAuthRequest.from_consumer_and_token(
        consumer, token, http_url=access_token_url, verifier=request.GET['oauth_verifier'])
    oauth_request.sign_request(signature_method, consumer, token)
    status, content = fetch(method=oauth_request.http_method, url=oauth_request.to_url())
    if status != 200:
        raise Exception("Invalid response from Twitter.", status, content)
    token = oauth.OAuthToken.from_string(content)

    # to session
    qs = cgi.parse_qs(content)
    request.session['screen_name'] = qs['screen_name'][0]
    request.session['access_token'] = token

    return HttpResponseRedirect(reverse(main))

# twitter_api を実行するための URL を返す
# url は http://api.twitter.com/1/ 以降
def sign(request, url):
    # return HttpResponse("error", status=404)

    if not settings.DEBUG and not request.is_ajax():
        return HttpResponseForbidden("error")
    
    src_params = request.GET

    params = {}
    for key, value in src_params.iteritems():
        params[key] = value.encode('utf-8')

    token = request.session['access_token']

    req = oauth.OAuthRequest.from_consumer_and_token(
        consumer,
        token=token,
        http_method="GET",
        http_url='http://api.twitter.com/1/' + url,
        parameters=params
        )
    
    req.sign_request(signature_method, consumer, token)

    return HttpResponse('{"url": "%s"}' % req.to_url())

# twitter_api を実行し、結果を返す
# url は http://api.twitter.com/1/ 以降
def twitter_api(request, url):
    # return HttpResponse("error", status=404)

    if not settings.DEBUG and not request.is_ajax():
        return HttpResponseForbidden("error")
    
    # return HttpResponse(url + " - " + str(len(request.GET)))

    token = request.session['access_token']

    src_params = request.GET
    if request.method == "POST":
        src_params = request.POST

    params = {}
    for key, value in src_params.iteritems():
        params[key] = value.encode('utf-8')

    url = 'http://api.twitter.com/1/' + url;

    status, content = fetch_oauth(url=url, method=request.method, parameters=params, token=token)
   
    return HttpResponse(content, status=status) # , 'application/json')

def upload(request):
    file = request.FILES.popitem()[1][0]
    datagen, headers = multipart_encode({
            'key': settings.TWITPIC_API_KEY,
            'message': request.POST['message'],
            'media': file})

    token = request.session['access_token']
    auth_service_provider_url = 'https://api.twitter.com/1/account/verify_credentials.json'

    req = oauth.OAuthRequest.from_consumer_and_token(
        consumer,
        token,
        http_method='GET',
        http_url=auth_service_provider_url
        )
    
    req.sign_request(signature_method, consumer, token)

    auth = ['%s="%s"' % (i, urllib.quote(str(req.get_parameter(i)))) for i in [
            'oauth_consumer_key',
            'oauth_signature_method',
            'oauth_token',
            'oauth_timestamp',
            'oauth_nonce',
            'oauth_version',
            'oauth_signature']]
    auth.append('realm="http://api.twitter.com/"')
    headers['X-Verify-Credentials-Authorization'] = 'OAuth ' + ', '.join(auth)
    headers['X-Auth-Service-Provider'] = auth_service_provider_url

    try:
        # raise urlfetch.DownloadError
        status, content = fetch(url='http://api.twitpic.com/2/upload.json',
                                method='POST',
                                payload="".join(datagen),
                                headers=headers)
        return HttpResponse(content, status=status)
    except urlfetch.DownloadError:
        return HttpResponse('{}', status='504')

# プロキシ
#
# 使用制限
# - ajax からのみ使用できる
# - セッションを持っているユーザのみ使用できる(todo)
# - http のみ
# - GET のみ
def proxy(request, url):
    # return HttpResponse("error", status=404)

    if not settings.DEBUG and not request.is_ajax():
        return HttpResponseForbidden("error")
    
    if request.method != "GET":
        return HttpResponseForbidden("error")

    url = "http://" + url + "?" + urllib.urlencode(request.GET)
    logger.info("proxy: %s", url)

    status, content = fetch(url=url, method="GET")
    return HttpResponse(content, status=status)

def index(request):
    return render_to_response("index.html", {})

def main(request):
    if 'access_token' not in request.session:
        return HttpResponseRedirect(reverse(index))
    
    return direct_to_template(request,
                              'main.html',
                              extra_context={
            'screen_name': request.session['screen_name']})

