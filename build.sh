#!/usr/bin/env bash

npm ci && docker build --tag "venthe/wkhtmltopdf:latest" --tag "venthe/wkhtmltopdf:${1:-0.0.1}" .