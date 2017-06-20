FROM kong:0.10

COPY ./start_kong.sh /usr/bin/start_kong
RUN yum install -y tcping &&\
    chmod +x /usr/bin/start_kong

