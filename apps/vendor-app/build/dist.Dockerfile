FROM nginx:stable-alpine

COPY dist/apps/vendor-app /usr/share/nginx/html
