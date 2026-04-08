# GitHub Actions

Reusable GitHub Actions for the organisation.

## `discord-notify`

This composite action sends a Discord webhook message for the current job.

### Org Secret

Create an organisation secret named `DISCORD_WEBHOOK_URL` and grant access to the repos that should send notifications.

### Usage

Add this as the last step in any job you want to monitor:

```yaml
- name: Discord notification
  if: always()
  uses: Decide4Action/GitHub_Actions/discord-notify@main
  with:
    webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
    status: ${{ job.status }}
```

### Optional Inputs

```yaml
- name: Discord notification
  if: always()
  uses: Decide4Action/GitHub_Actions/discord-notify@main
  with:
    webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
    status: ${{ job.status }}
    title: Build And Upload Main Installer
    message: Version 4.2.0 uploaded to SharePoint.
```

### Notes

- The action uses the current GitHub Actions context for repository, workflow, branch, actor, event, and run URL.
- The webhook URL is the only required secret.
- This is intended for workflow notifications, not interactive bot commands.
