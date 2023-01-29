FROM nginx:stable-alpine

COPY dist/apps/light-app /usr/share/nginx/html
