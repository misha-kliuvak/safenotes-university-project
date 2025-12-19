#!/bin/bash

# List of domains to check
domains=(
  "stage.mysafenotes.com"
  "dev.mysafenotes.com"

  "app.dev.mysafenotes.com"
  "app.stage.mysafenotes.com"

  "api.stage.mysafenotes.com"
  "api.stage.mysafenotes.com"

  "mysafenotes.com"
  "google.com"
)

# Function to check the status of a domain
check_domain_status() {
    domain="$1"
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$domain")
    status_msg=""

    if [ "$status_code" -eq 502 ]; then
        status_msg="Down (502 Bad Gateway)"
    else
        status_msg="Up (Status Code: $status_code)"
    fi

    printf "%-30s %-40s\n" "$domain" "$status_msg"
}


# Print header
printf "%-30s %-40s\n" "Domain" "Status"

# Loop through the list of domains and check their status
for domain in "${domains[@]}"; do
    check_domain_status "$domain"
done
