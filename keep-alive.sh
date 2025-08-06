#!/bin/bash

# Cron job script to keep Render service alive
# This script should be run every 14 minutes to prevent the service from sleeping

# Set the URL of your deployed application
URL="${RENDER_EXTERNAL_URL:-https://your-app-name.onrender.com}"

# Make a GET request to keep the service alive
curl -X GET "${URL}/api/ping" \
  -H "User-Agent: KeepAlive-Cron/1.0" \
  -w "Status: %{http_code}\nTotal time: %{time_total}s\n" \
  -s -o /dev/null

echo "Keep-alive ping sent to ${URL} at $(date)"
