# FlipReseller — GitHub → Slack

## 1. Native notifications (no code)
In your Slack channel (e.g. #flipreseller-dev):
```
/github subscribe samuelfreemanjobs-hash/mcp
```
Tune the event types:
```
/github subscribe samuelfreemanjobs-hash/mcp pulls issues commits releases
/github unsubscribe samuelfreemanjobs-hash/mcp deployments
```
Link your account for richer previews: `/github signin`.

## 2. Optional — release ping via Actions
For a custom Slack message on release, add a workflow that posts to a Slack Incoming Webhook. Store the webhook URL as a repo secret `SLACK_WEBHOOK_URL` and post with a `curl` step on the `release: published` event. (Kept out of this repo by default so the examples need no secrets to run.)
