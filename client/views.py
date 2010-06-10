# -*- coding: utf-8 -*- 

import time
import cgi

from django.shortcuts import render_to_response
from django.conf import settings
from django.http import HttpResponseRedirect
from django.http import HttpResponse
from django.core.urlresolvers import reverse

from appengine_utilities.sessions import Session

import oauth2 as oauth
import urllib

import twitter

consumer = oauth.Consumer(settings.TWITTER_CONSUMER_KEY, settings.TWITTER_CONSUMER_SECRET)
client = oauth.Client(consumer)

request_token_url = 'http://twitter.com/oauth/request_token'
authenticate_url = 'http://twitter.com/oauth/authorize'
access_token_url = 'http://twitter.com/oauth/access_token'


def login(request):
    # "oauth_callback": request.build_absolute_uri("authenticated")
    session = Session()
    
    resp, content = client.request(request_token_url, "GET")
    if resp['status'] != '200':
        raise Exception("Invalid response from Twitter.")

    session['request_token'] = dict(cgi.parse_qsl(content))

    url = "%s?%s" % (
        authenticate_url,
        urllib.urlencode({
                "oauth_token": session['request_token']['oauth_token']
                }))
    return HttpResponseRedirect(url)

def logout(request):
    session = Session()

    session.delete()
    return HttpResponseRedirect('/')

# リクエストトークンを認可された
def authenticated(request):
    session = Session()

    # リクエストトークン
    token = oauth.Token(session['request_token']['oauth_token'],
                        session['request_token']['oauth_token_secret'])
    client = oauth.Client(consumer, token)

    # アクセストークンをリクエスト
    resp, content = client.request(access_token_url, "GET")
    if resp['status'] != '200':
        raise Exception("Invalid response from Twitter.")

    """
    This is what you'll get back from Twitter. Note that it includes the
    user's user_id and screen_name.
    {
        'oauth_token_secret': 'IcJXPiJh8be3BjDWW50uCY31chyhsMHEhqJVsphC3M',
        'user_id': '120889797', 
        'oauth_token': '120889797-H5zNnM3qE0iFoTTpNEHIz3noL9FKzXiOxwtnyVOD',
        'screen_name': 'heyismysiteup'
    }
    """
    session['access_token'] = dict(cgi.parse_qsl(content))

    return HttpResponseRedirect(reverse(main))

# Twitter オブジェクトを生成する
def create_twitter():
    session = Session()

    return twitter.Twitter(settings.TWITTER_CONSUMER_KEY,
                           settings.TWITTER_CONSUMER_SECRET,
                           session['access_token']['oauth_token'],
                           session['access_token']['oauth_token_secret']
                           )

# 自身の情報を取得する
def user(request):
    session = Session()

    t = create_twitter()
    a = t.get("http://api.twitter.com/1/users/show/" +
              session['access_token']['user_id'] + 
              ".json", {})
    return HttpResponse(a)

# twitter_api を実行し、結果を返す
# url は http://api.twitter.com/1/ 以降
def twitter_api(request, url):
    session = Session()
    
    # return HttpResponse(url + " - " + str(len(request.GET)))

    src_params = request.GET
    if len(request.POST) >= 1:
        src_params = request.POST

    params = {}
    for key, value in src_params.iteritems():
        params[key] = value.encode('utf-8')

    t = create_twitter()

    url = 'http://api.twitter.com/1/' + url;

    if len(request.POST) >= 1:
        a = t.post(url, params)
    else:
        # a = t.post(url, params)
        a = t.get(url, params)

    return HttpResponse(a) # , 'application/json')

def index(request):
    return render_to_response("index.html", {})

def main(request):
    session = Session()

    if 'access_token' not in session:
        raise Exception('ろぐいんしてください')
    
    return render_to_response("main.html", {})
