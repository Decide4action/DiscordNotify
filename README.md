# GitHub Actions

Reusable GitHub Actions for the organisation.

## `discord-notify`

This action sends a Discord webhook message in the format `new version <version> out: <sharepoint link>`.

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
    version: 4.2.0
    sharepoint_link: https://contoso.sharepoint.com/sites/releases/Shared%20Documents/Installer/4.2.0
```

### Backward-Compatible Usage

```yaml
- name: Discord notification
  if: always()
  uses: Decide4Action/GitHub_Actions/discord-notify@main
  with:
    webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
    status: ${{ job.status }}
    title: Build And Upload Main Installer
    message: Version 4.2.0 uploaded to SharePoint: https://contoso.sharepoint.com/sites/releases/Shared%20Documents/Installer/4.2.0
```

### Notes

- Prefer passing `version` and `sharepoint_link` explicitly.
- If those inputs are omitted, the action will try to parse a version number and URL from `message` or `title`.
- The webhook URL is the only required secret.
- This is intended for workflow notifications, not interactive bot commands.
