# GitHub Service

## Overview

GitHub service enables automation based on repository events such as stars, issues, and pull requests. Monitor repository activity and create issues automatically based on triggers.

## Connection Setup

1. Navigate to `/api/connections/github` or use the frontend connection interface
2. Authorize AREA to access your GitHub account
3. OAuth scopes granted:
   - `repo` - Full control of private and public repositories
   - `read:user` - Read user profile data
   - `user:email` - Access to user's email addresses

---

## Service Details

- **Service Name:** `github`
- **Display Name:** GitHub
- **Description:** Repository monitoring and automation
- **Requires OAuth:** Yes
- **Actions:** 3
- **Reactions:** 1

---

## Actions

### 1. New Star on Repository

**Name:** `new_star_on_repo`

**Description:** Triggers when someone stars one of your repositories.

**Configuration:**
```json
{
  "repo_name": "username/repository"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `repo_name` | string | Yes | Full repository name in format `username/repo` |

**Example Workflow:**
```json
{
  "name": "Thank Stars",
  "action_id": <new_star_on_repo_id>,
  "reaction_id": <send_email_id>,
  "action_config": {
    "repo_name": "myusername/my-awesome-project"
  },
  "reaction_config": {
    "to": "me@email.com",
    "subject": "New Star!",
    "body": "Someone starred your repository!"
  }
}
```

**Use Cases:**
- Get notified when your repository gets stars
- Track repository popularity
- Send thank-you messages to stargazers
- Log star activity for analytics

---

### 2. New Issue Created

**Name:** `new_issue_created`

**Description:** Triggers when a new issue is created in your repository.

**Configuration:**
```json
{
  "repo_name": "username/repository"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `repo_name` | string | Yes | Full repository name in format `username/repo` |

**Example Workflow:**
```json
{
  "name": "Issue Alert",
  "action_id": <new_issue_created_id>,
  "reaction_id": <send_email_id>,
  "action_config": {
    "repo_name": "myusername/my-project"
  },
  "reaction_config": {
    "to": "team@company.com",
    "subject": "New GitHub Issue",
    "body": "A new issue was created in your repository"
  }
}
```

**Use Cases:**
- Get instant notifications on new issues
- Alert team members about new bug reports
- Create backup logs of all issues
- Trigger automated responses to issues

---

### 3. New Pull Request Opened

**Name:** `new_pr_opened`

**Description:** Triggers when a new pull request is opened in your repository.

**Configuration:**
```json
{
  "repo_name": "username/repository"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `repo_name` | string | Yes | Full repository name in format `username/repo` |

**Example Workflow:**
```json
{
  "name": "PR Notification",
  "action_id": <new_pr_opened_id>,
  "reaction_id": <log_message_id>,
  "action_config": {
    "repo_name": "myusername/open-source-project"
  },
  "reaction_config": {
    "message": "New PR opened - review needed!"
  }
}
```

**Use Cases:**
- Get notified about new pull requests
- Alert code reviewers automatically
- Track PR activity for metrics
- Create review reminder workflows

---

## Reactions

### 1. Create Issue

**Name:** `create_issue`

**Description:** Creates a new issue in a specified repository.

**Configuration:**
```json
{
  "repo_name": "username/repository",
  "title": "Bug Report",
  "body": "Detailed description of the issue"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `repo_name` | string | Yes | Full repository name in format `username/repo` |
| `title` | string | Yes | Issue title (max 200 characters) |
| `body` | string | Yes | Issue description/body (max 5000 characters) |

**Example Workflow:**
```json
{
  "name": "Auto-Report Failures",
  "action_id": <email_subject_contains_id>,
  "reaction_id": <create_issue_id>,
  "action_config": {
    "keyword": "FAILURE"
  },
  "reaction_config": {
    "repo_name": "myusername/monitoring",
    "title": "Automated Failure Report",
    "body": "A failure was detected in the system. Please investigate."
  }
}
```

**Use Cases:**
- Automatically create issues from error notifications
- Cross-post bugs from other platforms
- Schedule recurring tasks as issues
- Create issues from user feedback

---

## Common Use Cases

### 1. Star Tracker with Email Alerts
- **Trigger:** New star on repository
- **Reaction:** Send email notification to yourself

### 2. Issue-to-Issue Automation
- **Trigger:** New issue in Repository A
- **Reaction:** Create issue in Repository B (cross-repo tracking)

### 3. PR Review Reminders
- **Trigger:** New PR opened
- **Reaction:** Send email to code review team

### 4. Automated Bug Reporting
- **Trigger:** Email subject contains "ERROR"
- **Reaction:** Create GitHub issue with error details

### 5. Repository Activity Logging
- **Trigger:** New star/issue/PR
- **Reaction:** Log message to workflow logs for analytics

---

## API Endpoints

See [OAuth Connections](./api-oauth-connections.md#github-oauth-connections) for connection endpoints.

---

## Limitations

- **Rate Limiting:** GitHub API has rate limits (5000 requests/hour for authenticated users)
- **Repository Access:** Can only monitor repositories you have access to
- **Event Detection:** Scheduler checks every 1 minute, so there may be delays
- **Issue Creation:** Requires write access to the target repository
- **Private Repos:** Requires `repo` scope for private repository access

---

## Troubleshooting

**Events Not Being Detected:**
- Verify repository name is in correct format: `username/repo`
- Check OAuth connection is active at `/api/connections`
- Ensure you have access to the repository
- Scheduler runs every 1 minute - there may be a delay
- For private repos, ensure `repo` scope was granted

**Create Issue Fails:**
- Verify you have write access to the repository
- Check repository name format: `username/repo`
- Ensure title doesn't exceed 200 characters
- Ensure body doesn't exceed 5000 characters
- Verify OAuth connection has `repo` scope

**Repository Not Found:**
- Double-check spelling of repository name
- Ensure you have access to the repository
- For organization repos, use `organization/repo` format
- Private repos require `repo` OAuth scope

---

## Advanced Usage

### Repository Name Format

Always use the full repository name including the owner:
- Correct: `octocat/Hello-World`
- Incorrect: `Hello-World`

### Monitoring Multiple Repositories

Create separate workflows for each repository you want to monitor:

```json
{
  "name": "Monitor Project A",
  "action_id": <new_issue_created_id>,
  "action_config": {
    "repo_name": "username/project-a"
  }
}
```

```json
{
  "name": "Monitor Project B",
  "action_id": <new_issue_created_id>,
  "action_config": {
    "repo_name": "username/project-b"
  }
}
```

### Cross-Repository Workflows

Create issues in one repository based on events in another:

```json
{
  "name": "Bug Tracker",
  "action_id": <new_issue_created_id>,
  "reaction_id": <create_issue_id>,
  "action_config": {
    "repo_name": "company/production-app"
  },
  "reaction_config": {
    "repo_name": "company/bug-tracker",
    "title": "Bug reported in production",
    "body": "New bug issue detected"
  }
}
```
