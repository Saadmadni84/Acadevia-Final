FROM mysql:8.0
COPY my.cnf /etc/mysql/conf.d/acadevia.cnf
COPY init/ /docker-entrypoint-initdb.d/
RUN mkdir -p /var/log/mysql && chown mysql:mysql /var/log/mysql
