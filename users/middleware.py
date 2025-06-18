from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.http import HttpResponse
from django.urls import reverse
import json
from django.conf import settings
class JWTTokenCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip middleware for register, login, and token refresh endpoints
        if request.path in ['/api/users/register/', '/api/users/login/', '/api/users/token/refresh/']:
            return self.get_response(request)

        access_token = request.COOKIES.get('access_token')
        refresh_token = request.COOKIES.get('refresh_token')

        if access_token:
            try:
                # Validate the access token
                AccessToken(access_token)
                request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
            except (InvalidToken, TokenError):
                # If access token is invalid or expired, try to refresh it
                if refresh_token:
                    try:
                        refresh = RefreshToken(refresh_token)
                        new_access_token = str(refresh.access_token)
                        new_refresh_token = str(refresh)  # Get new refresh token if rotation is enabled

                        # Prepare response to set new cookies
                        response = self.get_response(request)
                        
                        # Update the authorization header with new access token
                        request.META['HTTP_AUTHORIZATION'] = f'Bearer {new_access_token}'
                        
                        # Set new cookies
                        response.set_cookie(
                            'access_token',
                            new_access_token,
                            httponly=True,
                            samesite='Lax',
                            secure=not settings.DEBUG
                        )
                        response.set_cookie(
                            'refresh_token',
                            new_refresh_token,
                            httponly=True,
                            samesite='Lax',
                            secure=not settings.DEBUG
                        )
                        return response
                    except (InvalidToken, TokenError):
                        # If refresh token is invalid, clear cookies and return unauthorized
                        response = HttpResponse(
                            content=json.dumps({'detail': 'Refresh token is invalid or expired'}),
                            status=401,
                            content_type='application/json'
                        )
                        response.delete_cookie('access_token')
                        response.delete_cookie('refresh_token')
                        return response
                else:
                    # No refresh token available
                    response = HttpResponse(
                        content=json.dumps({'detail': 'No refresh token available'}),
                        status=401,
                        content_type='application/json'
                    )
                    response.delete_cookie('access_token')
                    return response
        return self.get_response(request)