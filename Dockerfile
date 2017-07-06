FROM zzrot/alpine-caddy
MAINTAINER shea.phillips@cloudcompass.ca

ADD . /var/www/html

ADD Caddyfile /etc/Caddyfile

EXPOSE 2015
