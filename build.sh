#!/usr/bin/env bash

npm ci && docker build --tag venthe/wkhtmltopdf:latest .