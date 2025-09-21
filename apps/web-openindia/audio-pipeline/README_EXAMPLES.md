Examples

Node CLI:

```bash
cd apps/web-openindia/audio-pipeline
npm install
node dist/cli.js "Welcome to OpenIndia" openindia-welcome.mp3
```

cURL POST:

```bash
curl -X POST https://<CLOUD_RUN_URL>/synthesize -H "Content-Type: application/json" -d '{"text":"Hi","filename":"hi.mp3","makePublic":true}'
```
