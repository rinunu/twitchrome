import oauth2 as oauth
import time
import urllib2

class Twitter:
    def __init__(self, consumer_key, consumer_secret, token, token_secret):
        self.token = oauth.Token(key=token, secret=token_secret)
        self.consumer = oauth.Consumer(key=consumer_key, secret=consumer_secret)
    
    def get(self, url, parameters):
        req = oauth.Request.from_consumer_and_token(
            self.consumer,
            self.token,
            http_method="GET",
            http_url=url,
            parameters=parameters
            )
        
        req.sign_request(oauth.SignatureMethod_HMAC_SHA1(), self.consumer, self.token)

        f = urllib2.urlopen(req.to_url())
        return f.read()
    
    def post(self, url, parameters):
        req = oauth.Request.from_consumer_and_token(
            self.consumer,
            self.token,
            http_method="POST",
            http_url=url,
            parameters=parameters
            )
        
        req.sign_request(oauth.SignatureMethod_HMAC_SHA1(), self.consumer, self.token)
        f = urllib2.urlopen(url, req.to_postdata())
        return f.read()
