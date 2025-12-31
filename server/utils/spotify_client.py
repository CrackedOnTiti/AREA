import requests
from datetime import datetime, timezone


def get_user_playlists(access_token, limit=20):
    """Fetch user's playlists"""
    try:
        url = "https://api.spotify.com/v1/me/playlists"

        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        params = {
            'limit': limit
        }

        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        data = response.json()
        playlists = []

        for playlist in data.get('items', []):
            playlists.append({
                'id': playlist['id'],
                'name': playlist['name'],
                'tracks_total': playlist['tracks']['total']
            })

        return playlists

    except requests.exceptions.RequestException as e:
        print(f"Error fetching Spotify playlists: {str(e)}")
        return []
    except Exception as e:
        print(f"Error processing Spotify playlists: {str(e)}")
        return []


def get_playlist_tracks(access_token, playlist_id, since_timestamp=None, limit=20):
    """Fetch tracks from a specific playlist"""
    try:
        url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"

        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        params = {
            'limit': limit
        }

        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        data = response.json()
        tracks = []

        for item in data.get('items', []):
            added_at_str = item.get('added_at')
            if added_at_str:
                added_at = datetime.fromisoformat(added_at_str.replace('Z', '+00:00'))

                # Filter by timestamp if provided
                if since_timestamp and added_at.timestamp() < since_timestamp:
                    continue

                track = item.get('track', {})
                if track:
                    tracks.append({
                        'id': track['id'],
                        'name': track['name'],
                        'artists': ', '.join([artist['name'] for artist in track.get('artists', [])]),
                        'uri': track['uri'],
                        'added_at': added_at
                    })

        return tracks

    except requests.exceptions.RequestException as e:
        print(f"Error fetching playlist tracks: {str(e)}")
        return []
    except Exception as e:
        print(f"Error processing playlist tracks: {str(e)}")
        return []


def get_user_saved_tracks(access_token, since_timestamp=None, limit=20):
    """Fetch user's saved (liked) tracks"""
    try:
        url = "https://api.spotify.com/v1/me/tracks"

        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        params = {
            'limit': limit
        }

        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        data = response.json()
        tracks = []

        for item in data.get('items', []):
            added_at_str = item.get('added_at')
            if added_at_str:
                added_at = datetime.fromisoformat(added_at_str.replace('Z', '+00:00'))

                # Filter by timestamp if provided
                if since_timestamp and added_at.timestamp() < since_timestamp:
                    continue

                track = item.get('track', {})
                if track:
                    tracks.append({
                        'id': track['id'],
                        'name': track['name'],
                        'artists': ', '.join([artist['name'] for artist in track.get('artists', [])]),
                        'uri': track['uri'],
                        'added_at': added_at
                    })

        return tracks

    except requests.exceptions.RequestException as e:
        print(f"Error fetching saved tracks: {str(e)}")
        return []
    except Exception as e:
        print(f"Error processing saved tracks: {str(e)}")
        return []


def get_current_playback(access_token):
    """Get user's current playback state"""
    try:
        url = "https://api.spotify.com/v1/me/player"

        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        response = requests.get(url, headers=headers)

        # 204 means no content (nothing playing)
        if response.status_code == 204:
            return None

        response.raise_for_status()

        data = response.json()

        if not data or not data.get('item'):
            return None

        track = data['item']
        return {
            'is_playing': data.get('is_playing', False),
            'track_id': track['id'],
            'track_name': track['name'],
            'artists': ', '.join([artist['name'] for artist in track.get('artists', [])]),
            'uri': track['uri']
        }

    except requests.exceptions.RequestException as e:
        print(f"Error fetching current playback: {str(e)}")
        return None
    except Exception as e:
        print(f"Error processing current playback: {str(e)}")
        return None


def add_track_to_playlist(access_token, playlist_id, track_uri):
    """Add a track to a playlist"""
    try:
        url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        data = {
            'uris': [track_uri if track_uri.startswith('spotify:') else f'spotify:track:{track_uri}']
        }

        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()

        return {
            'success': True,
            'message': 'Track added to playlist successfully'
        }

    except requests.exceptions.RequestException as e:
        error_msg = str(e)
        try:
            error_data = e.response.json()
            error_msg = error_data.get('error', {}).get('message', error_msg)
        except:
            pass

        return {
            'success': False,
            'error': f'Failed to add track to playlist: {error_msg}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Error adding track to playlist: {str(e)}'
        }


def create_playlist(access_token, user_id, name, description='', public=True):
    """Create a new playlist for the user"""
    try:
        url = f"https://api.spotify.com/v1/users/{user_id}/playlists"

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        data = {
            'name': name,
            'description': description,
            'public': public
        }

        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()

        result = response.json()

        return {
            'success': True,
            'playlist_id': result['id'],
            'playlist_url': result['external_urls']['spotify'],
            'message': f'Created playlist: {name}'
        }

    except requests.exceptions.RequestException as e:
        error_msg = str(e)
        try:
            error_data = e.response.json()
            error_msg = error_data.get('error', {}).get('message', error_msg)
        except:
            pass

        return {
            'success': False,
            'error': f'Failed to create playlist: {error_msg}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Error creating playlist: {str(e)}'
        }


def start_playback(access_token, track_uri=None, context_uri=None):
    """Start or resume playback"""
    try:
        url = "https://api.spotify.com/v1/me/player/play"

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        data = {}
        if track_uri:
            data['uris'] = [track_uri if track_uri.startswith('spotify:') else f'spotify:track:{track_uri}']
        elif context_uri:
            data['context_uri'] = context_uri

        response = requests.put(url, headers=headers, json=data)
        response.raise_for_status()

        return {
            'success': True,
            'message': 'Playback started successfully'
        }

    except requests.exceptions.RequestException as e:
        error_msg = str(e)
        try:
            error_data = e.response.json()
            error_msg = error_data.get('error', {}).get('message', error_msg)
        except:
            pass

        return {
            'success': False,
            'error': f'Failed to start playback: {error_msg}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Error starting playback: {str(e)}'
        }


def pause_playback(access_token):
    """Pause playback"""
    try:
        url = "https://api.spotify.com/v1/me/player/pause"

        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        response = requests.put(url, headers=headers)
        response.raise_for_status()

        return {
            'success': True,
            'message': 'Playback paused successfully'
        }

    except requests.exceptions.RequestException as e:
        error_msg = str(e)
        try:
            error_data = e.response.json()
            error_msg = error_data.get('error', {}).get('message', error_msg)
        except:
            pass

        return {
            'success': False,
            'error': f'Failed to pause playback: {error_msg}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Error pausing playback: {str(e)}'
        }


def save_track(access_token, track_id):
    """Save a track to user's library"""
    try:
        url = "https://api.spotify.com/v1/me/tracks"

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        data = {
            'ids': [track_id.replace('spotify:track:', '')]
        }

        response = requests.put(url, headers=headers, json=data)
        response.raise_for_status()

        return {
            'success': True,
            'message': 'Track saved to library successfully'
        }

    except requests.exceptions.RequestException as e:
        error_msg = str(e)
        try:
            error_data = e.response.json()
            error_msg = error_data.get('error', {}).get('message', error_msg)
        except:
            pass

        return {
            'success': False,
            'error': f'Failed to save track: {error_msg}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Error saving track: {str(e)}'
        }


def get_user_profile(access_token):
    """Get user's Spotify profile"""
    try:
        url = "https://api.spotify.com/v1/me"

        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        response = requests.get(url, headers=headers)
        response.raise_for_status()

        data = response.json()

        return {
            'id': data['id'],
            'display_name': data.get('display_name', data['id']),
            'email': data.get('email')
        }

    except requests.exceptions.RequestException as e:
        print(f"Error fetching user profile: {str(e)}")
        return None
    except Exception as e:
        print(f"Error processing user profile: {str(e)}")
        return None
