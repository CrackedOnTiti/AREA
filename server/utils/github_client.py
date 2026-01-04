import requests
from datetime import datetime, timezone


def fetch_repo_stargazers(access_token, repo_name, since_timestamp=None, limit=10):
    """Fetch recent stargazers (people who liked the repo) for a repository"""
    try:
        url = f"https://api.github.com/repos/{repo_name}/stargazers"

        headers = {
            'Authorization': f'token {access_token}',
            'Accept': 'application/vnd.github.v3.star+json'  # Get timestamps
        }

        params = {
            'per_page': limit
        }

        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        stargazers = response.json()

        # Filter by timestamp if provided
        filtered = []
        for star in stargazers:
            starred_at_str = star.get('starred_at')
            if starred_at_str:
                starred_at = datetime.fromisoformat(starred_at_str.replace('Z', '+00:00'))

                if since_timestamp:
                    if starred_at.timestamp() >= since_timestamp:
                        filtered.append({
                            'user': star['user']['login'],
                            'starred_at': starred_at
                        })
                else:
                    filtered.append({
                        'user': star['user']['login'],
                        'starred_at': starred_at
                    })

        return filtered

    except requests.exceptions.RequestException as e:
        print(f"Error fetching GitHub stargazers: {str(e)}")
        return []
    except Exception as e:
        print(f"Error processing GitHub stargazers: {str(e)}")
        return []


def fetch_repo_issues(access_token, repo_name, since_timestamp=None, limit=10):
    """Fetch recent issues from a repository"""
    try:
        url = f"https://api.github.com/repos/{repo_name}/issues"

        headers = {
            'Authorization': f'token {access_token}',
            'Accept': 'application/vnd.github.v3+json'
        }

        params = {
            'state': 'all',
            'sort': 'created',
            'direction': 'desc',
            'per_page': limit
        }

        if since_timestamp:
            since_dt = datetime.fromtimestamp(since_timestamp, tz=timezone.utc)
            params['since'] = since_dt.isoformat()

        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        issues = response.json()

        # Filter out pull requests (they show up in issues endpoint)
        filtered_issues = []
        for issue in issues:
            if 'pull_request' not in issue:  # Exclude PRs
                created_at_str = issue.get('created_at')
                created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))

                filtered_issues.append({
                    'number': issue['number'],
                    'title': issue['title'],
                    'body': issue.get('body', ''),
                    'user': issue['user']['login'],
                    'created_at': created_at,
                    'html_url': issue['html_url']
                })

        return filtered_issues

    except requests.exceptions.RequestException as e:
        print(f"Error fetching GitHub issues: {str(e)}")
        return []
    except Exception as e:
        print(f"Error processing GitHub issues: {str(e)}")
        return []


def fetch_repo_pull_requests(access_token, repo_name, since_timestamp=None, limit=10):
    """Fetch recent pull requests from a repository"""
    try:
        url = f"https://api.github.com/repos/{repo_name}/pulls"

        headers = {
            'Authorization': f'token {access_token}',
            'Accept': 'application/vnd.github.v3+json'
        }

        params = {
            'state': 'all',
            'sort': 'created',
            'direction': 'desc',
            'per_page': limit
        }

        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        prs = response.json()

        # Format and filter PRs
        filtered_prs = []
        for pr in prs:
            created_at_str = pr.get('created_at')
            created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))

            if since_timestamp:
                if created_at.timestamp() < since_timestamp:
                    continue

            filtered_prs.append({
                'number': pr['number'],
                'title': pr['title'],
                'body': pr.get('body', ''),
                'user': pr['user']['login'],
                'created_at': created_at,
                'html_url': pr['html_url'],
                'state': pr['state']
            })

        return filtered_prs

    except requests.exceptions.RequestException as e:
        print(f"Error fetching GitHub PRs: {str(e)}")
        return []
    except Exception as e:
        print(f"Error processing GitHub PRs: {str(e)}")
        return []


def create_issue(access_token, repo_name, title, body):
    """Create a new issue in a repository"""
    try:
        url = f"https://api.github.com/repos/{repo_name}/issues"

        headers = {
            'Authorization': f'token {access_token}',
            'Accept': 'application/vnd.github.v3+json'
        }

        data = {
            'title': title,
            'body': body
        }

        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()

        result = response.json()

        return {
            'success': True,
            'issue_url': result['html_url'],
            'message': f'Created issue #{result["number"]}: {title}'
        }

    except requests.exceptions.RequestException as e:
        error_msg = str(e)
        try:
            error_data = e.response.json()
            error_msg = error_data.get('message', error_msg)
        except:
            pass

        return {
            'success': False,
            'error': f'Failed to create GitHub issue: {error_msg}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Error creating GitHub issue: {str(e)}'
        }
