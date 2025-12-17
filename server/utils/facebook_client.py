import requests
from datetime import datetime, timezone


def fetch_user_posts(access_token, since_timestamp=None, limit=10):
    """Fetch recent posts from user's personal timeline"""
    try:
        url = "https://graph.facebook.com/v18.0/me/posts"

        params = {
            'access_token': access_token,
            'fields': 'id,message,created_time,permalink_url',
            'limit': limit
        }

        if since_timestamp:
            params['since'] = int(since_timestamp)

        response = requests.get(url, params=params)
        response.raise_for_status()

        data = response.json()
        posts = data.get('data', [])

        # Convert to our format
        formatted_posts = []
        for post in posts:
            # Parse created_time to datetime
            created_str = post.get('created_time')
            if created_str:
                created_dt = datetime.fromisoformat(created_str.replace('Z', '+00:00'))
            else:
                created_dt = datetime.now(timezone.utc)

            formatted_posts.append({
                'id': post.get('id'),
                'message': post.get('message', ''),
                'created_time': created_dt,
                'permalink': post.get('permalink_url', '')
            })

        return formatted_posts

    except requests.exceptions.RequestException as e:
        print(f"Error fetching Facebook posts: {str(e)}")
        return []
    except Exception as e:
        print(f"Error processing Facebook posts: {str(e)}")
        return []


def check_post_contains_keyword(post, keyword):
    """Check if post message contains keyword"""
    message = post.get('message', '').lower()
    keyword_lower = keyword.lower()
    return keyword_lower in message
