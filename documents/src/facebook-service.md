# Facebook Service

## Overview

Facebook service provides automation for monitoring and creating posts on your personal timeline. Monitor your posting activity and automatically create posts based on triggers.

## Connection Setup

1. Navigate to `/api/connections/facebook` or use the frontend connection interface
2. Authorize AREA to access your Facebook account
3. OAuth scopes granted:
   - `email` - User's email address
   - `public_profile` - Basic profile information
   - `user_posts` - Read and create posts on your timeline

---

## Service Details

- **Service Name:** `facebook`
- **Display Name:** Facebook
- **Description:** Personal timeline post monitoring
- **Requires OAuth:** Yes
- **Actions:** 2
- **Reactions:** 1

---

## Actions

### 1. New Post Created

**Name:** `new_post_created`

**Description:** Triggers when you create a new post on your Facebook timeline.

**Configuration:**
```json
{}
```

**Parameters:** None

**Example Workflow:**
```json
{
  "name": "Log My Posts",
  "action_id": <new_post_created_id>,
  "reaction_id": <log_message_id>,
  "action_config": {},
  "reaction_config": {
    "message": "You just posted on Facebook!"
  }
}
```

**Use Cases:**
- Track your posting frequency
- Get notifications when you post
- Create backups of your posts
- Log posting activity to external services

---

### 2. Post Contains Keyword

**Name:** `post_contains_keyword`

**Description:** Triggers when you create a Facebook post that contains a specific keyword.

**Configuration:**
```json
{
  "keyword": "vacation"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `keyword` | string | Yes | Keyword to search for in post content (case-insensitive) |

**Example Workflow:**
```json
{
  "name": "Track Work Posts",
  "action_id": <post_contains_keyword_id>,
  "reaction_id": <send_email_id>,
  "action_config": {
    "keyword": "work"
  },
  "reaction_config": {
    "to": "manager@company.com",
    "subject": "Work-related Facebook post",
    "body": "You posted about work on Facebook"
  }
}
```

**Use Cases:**
- Monitor posts about specific topics
- Track mentions of certain keywords
- Alert on sensitive content
- Create topic-based archives

---

## Reactions

### 1. Create Post

**Name:** `create_post`

**Description:** Creates a new post on your Facebook timeline.

**Configuration:**
```json
{
  "message": "Hello from AREA automation!"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | Content of the post (max 5000 characters) |

**Example Workflow:**
```json
{
  "name": "Daily Motivational Post",
  "action_id": <time_matches_id>,
  "reaction_id": <create_post_id>,
  "action_config": {
    "time": "08:00"
  },
  "reaction_config": {
    "message": "Good morning! Have a great day!"
  }
}
```

**Use Cases:**
- Schedule automated posts
- Cross-post from other platforms
- Share daily updates automatically
- Post reminders or announcements

---

## Common Use Cases

### 1. Daily Automated Posts
- **Trigger:** Time matches (e.g., 9:00 AM)
- **Reaction:** Create post with motivational quote

### 2. Cross-Platform Posting
- **Trigger:** New file uploaded to Drive
- **Reaction:** Create Facebook post announcing the upload

### 3. Post Activity Tracking
- **Trigger:** New post created
- **Reaction:** Log message to workflow logs for analytics

### 4. Keyword-Based Workflows
- **Trigger:** Post contains "event"
- **Reaction:** Create Drive file with event details

### 5. Scheduled Announcements
- **Trigger:** Date matches (specific date)
- **Reaction:** Create post with announcement

---

## API Endpoints

See [OAuth Connections](./api-oauth-connections.md#facebook-oauth-connections) for connection endpoints.

---

## Limitations

- **Post Monitoring:** Only detects your own posts, not friends' posts
- **Rate Limiting:** Facebook Graph API has rate limits - excessive posting may be throttled
- **Permissions:** Requires `user_posts` permission during OAuth authorization
- **Content:** Posts are text-only (no images/videos through this API)
- **Timeline:** Can only post to your own timeline, not to pages or groups

---

## Troubleshooting

**Posts Not Being Detected:**
- Verify OAuth connection is active at `/api/connections`
- Check that `user_posts` permission was granted during authorization
- Scheduler runs every 1 minute - there may be a delay
- Ensure you're checking your own posts, not others'

**Create Post Fails:**
- Check message content doesn't exceed 5000 characters
- Verify Facebook OAuth connection is valid
- Check for Facebook API rate limiting
- Ensure message is not empty

**Keyword Detection Not Working:**
- Keyword search is case-insensitive but must be exact match
- Check for typos in keyword configuration
- Special characters may affect matching

---

## Future Enhancements

See [Issue #73](https://github.com/CrackedOnTiti/AREA/issues/73) for planned optional features:
- Post comment on own posts
- Like/react to posts
- Trigger on post reactions/likes received
- Trigger on post comments received
