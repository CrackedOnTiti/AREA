# Spotify Service

## Overview

Spotify service provides automation for music playback, playlist management, and library monitoring. Control your music, manage playlists, and track your listening activity automatically.

## Connection Setup

1. Navigate to `/api/connections/spotify` or use the frontend connection interface
2. Authorize AREA to access your Spotify account
3. OAuth scopes granted:
   - `user-read-playback-state` - Read current playback state
   - `user-modify-playback-state` - Control playback
   - `playlist-read-private` - Read private playlists
   - `playlist-modify-public` - Modify public playlists
   - `playlist-modify-private` - Modify private playlists
   - `user-library-read` - Read saved tracks
   - `user-library-modify` - Modify saved tracks

**Note:** Both Free and Premium Spotify accounts can connect, but some playback features require Spotify Premium.

---

## Service Details

- **Service Name:** `spotify`
- **Display Name:** Spotify
- **Description:** Music playback control and playlist management
- **Requires OAuth:** Yes
- **Actions:** 3
- **Reactions:** 3

---

## Actions

### 1. Track Added to Playlist

**Name:** `track_added_to_playlist`

**Description:** Triggers when a new track is added to a specific playlist.

**Configuration:**
```json
{
  "playlist_id": "37i9dQZF1DXcBWIGoYBM5M"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `playlist_id` | string | Yes | Spotify playlist ID (found in playlist URL or share link) |

**How to find playlist ID:**
- Open playlist in Spotify
- Click Share → Copy link to playlist
- Extract ID from URL: `spotify.com/playlist/[THIS_IS_THE_ID]`

**Example Workflow:**
```json
{
  "name": "Log Playlist Updates",
  "action_id": <track_added_to_playlist_id>,
  "reaction_id": <log_message_id>,
  "action_config": {
    "playlist_id": "37i9dQZF1DXcBWIGoYBM5M"
  },
  "reaction_config": {
    "message": "New track added to your playlist!"
  }
}
```

**Use Cases:**
- Track changes to collaborative playlists
- Get notified when curated playlists update
- Create backups of playlist changes
- Monitor playlist growth

---

### 2. Track Saved to Library

**Name:** `track_saved`

**Description:** Triggers when you save (like) a new track to your library.

**Configuration:**
```json
{}
```

**Parameters:** None

**Example Workflow:**
```json
{
  "name": "Auto-Add Liked Songs to Playlist",
  "action_id": <track_saved_id>,
  "reaction_id": <add_to_playlist_id>,
  "action_config": {},
  "reaction_config": {
    "playlist_id": "your-favorites-playlist-id",
    "track_uri": "spotify:track:TRACK_ID"
  }
}
```

**Use Cases:**
- Automatically add liked songs to a specific playlist
- Get notifications when you like songs
- Track your music discovery patterns
- Create monthly "liked songs" reports

---

### 3. Playback Started

**Name:** `playback_started`

**Description:** Triggers when you start playing music on Spotify.

**Configuration:**
```json
{}
```

**Parameters:** None

**Example Workflow:**
```json
{
  "name": "Log Listening Sessions",
  "action_id": <playback_started_id>,
  "reaction_id": <log_message_id>,
  "action_config": {},
  "reaction_config": {
    "message": "Started listening to music"
  }
}
```

**Use Cases:**
- Track listening habits
- Create time-based listening logs
- Trigger actions when music starts (e.g., smart home automation)
- Monitor music playback sessions

---

## Reactions

### 1. Add Track to Playlist

**Name:** `add_to_playlist`

**Description:** Adds a track to a specific playlist.

**Configuration:**
```json
{
  "playlist_id": "37i9dQZF1DXcBWIGoYBM5M",
  "track_uri": "spotify:track:6rqhFgbbKwnb9MLmUQDhG6"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `playlist_id` | string | Yes | Spotify playlist ID |
| `track_uri` | string | Yes | Spotify track URI or ID (formats: `spotify:track:xxxxx` or just track ID) |

**How to find track URI:**
- Right-click track in Spotify → Share → Copy Song Link
- Extract ID from URL: `spotify.com/track/[THIS_IS_THE_ID]`
- Use as: `spotify:track:[ID]` or just the ID

**Example Workflow:**
```json
{
  "name": "Backup Liked Songs",
  "action_id": <track_saved_id>,
  "reaction_id": <add_to_playlist_id>,
  "action_config": {},
  "reaction_config": {
    "playlist_id": "your-backup-playlist-id",
    "track_uri": "spotify:track:6rqhFgbbKwnb9MLmUQDhG6"
  }
}
```

**Use Cases:**
- Automatically organize liked songs into playlists
- Create genre-specific auto-curated playlists
- Backup favorite tracks to multiple playlists
- Share tracks across collaborative playlists

---

### 2. Create Playlist

**Name:** `create_playlist`

**Description:** Creates a new playlist in your Spotify account.

**Configuration:**
```json
{
  "name": "My Automated Playlist",
  "description": "Created by AREA automation",
  "public": true
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Playlist name (max 100 characters) |
| `description` | string | No | Playlist description (max 300 characters) |
| `public` | boolean | No | Make playlist public (default: true) |

**Example Workflow:**
```json
{
  "name": "Weekly Playlist Creator",
  "action_id": <time_matches_id>,
  "reaction_id": <create_playlist_id>,
  "action_config": {
    "time": "00:00"
  },
  "reaction_config": {
    "name": "Weekly Favorites",
    "description": "Auto-generated playlist",
    "public": false
  }
}
```

**Use Cases:**
- Create monthly/weekly playlists automatically
- Generate playlists based on time or date triggers
- Organize music collections programmatically
- Create themed playlists on schedule

---

### 3. Start Playback

**Name:** `start_playback`

**Description:** Starts playing a specific track or playlist on your active Spotify device.

**Configuration:**
```json
{
  "track_uri": "spotify:track:6rqhFgbbKwnb9MLmUQDhG6",
  "context_uri": "spotify:playlist:37i9dQZF1DXcBWIGoYBM5M"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `track_uri` | string | No | Spotify track URI to play |
| `context_uri` | string | No | Spotify playlist/album URI for context |

**Note:** At least one parameter should be provided. If both are provided, track plays within the context.

**Example Workflow:**
```json
{
  "name": "Morning Alarm Music",
  "action_id": <time_matches_id>,
  "reaction_id": <start_playback_id>,
  "action_config": {
    "time": "07:00"
  },
  "reaction_config": {
    "context_uri": "spotify:playlist:your-morning-playlist-id"
  }
}
```

**Use Cases:**
- Wake up to music at specific times
- Start playlist when arriving home (with location triggers)
- Play focus music during work hours
- Automated DJ for events

---

## Common Use Cases

### 1. Auto-Archive Liked Songs
- **Trigger:** Track saved to library
- **Reaction:** Add to monthly backup playlist

### 2. Morning Music Routine
- **Trigger:** Time matches (7:00 AM)
- **Reaction:** Start playback of energizing playlist

### 3. Playlist Change Notifications
- **Trigger:** Track added to followed playlist
- **Reaction:** Send email notification

### 4. Monthly Playlist Generator
- **Trigger:** Date matches (1st of month)
- **Reaction:** Create new playlist for the month

### 5. Music Discovery Tracker
- **Trigger:** Track saved to library
- **Reaction:** Log to Drive file for monthly review

---

## API Endpoints

See [OAuth Connections](./api-oauth-connections.md#spotify-oauth-connections) for connection endpoints.

---

## Limitations

- **Playback Control:** Requires Spotify Premium for on-demand playback
- **Active Device:** Start playback requires an active Spotify device (phone, computer, speaker)
- **Rate Limiting:** Spotify API has rate limits
- **Track URIs:** Must use valid Spotify URIs or IDs
- **Playlist Access:** Can only modify playlists you own or have edit access to
- **Free Users:** Limited playback control features

---

## Troubleshooting

**Tracks Not Being Detected:**
- Verify OAuth connection is active at `/api/connections`
- Check playlist ID is correct
- Ensure playlist is accessible to your account
- Scheduler runs every 1 minute - there may be a delay

**Add to Playlist Fails:**
- Verify you have edit permissions for the playlist
- Check track URI format (should be `spotify:track:ID` or just ID)
- Ensure playlist ID is valid
- Track must exist in Spotify's catalog

**Start Playback Fails:**
- **Most common:** No active Spotify device
  - Solution: Open Spotify on phone/computer/speaker first
- Verify Spotify Premium subscription (required for playback control)
- Check track/playlist URI is valid
- Ensure OAuth scopes include `user-modify-playback-state`

**Create Playlist Fails:**
- Check playlist name doesn't exceed 100 characters
- Verify OAuth connection is active
- Ensure description doesn't exceed 300 characters

---

## Advanced Usage

### Finding Spotify IDs and URIs

**Playlist ID:**
```
URL: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
ID:  37i9dQZF1DXcBWIGoYBM5M
```

**Track URI:**
```
URL: https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6
URI: spotify:track:6rqhFgbbKwnb9MLmUQDhG6
ID:  6rqhFgbbKwnb9MLmUQDhG6
```

### Playback Devices

For `start_playback` to work, you need an active Spotify device:
1. Open Spotify on any device (phone, computer, web player, smart speaker)
2. Start playing any track (can pause it immediately)
3. Device is now "active" and can receive playback commands
4. Device must remain connected and logged in

### URI Formats

AREA accepts multiple formats for track URIs:
- `spotify:track:6rqhFgbbKwnb9MLmUQDhG6`
- `6rqhFgbbKwnb9MLmUQDhG6`
- `https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6`

All formats are automatically normalized to the correct Spotify URI format.
