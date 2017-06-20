FROM  nodesource/centos7:6
ENV NODE_ENV=development
COPY . /opt/kingkong
WORKDIR /opt/kingkong
RUN yum install -y wget
RUN wget http://repository.it4i.cz/mirrors/repoforge/redhat/el7/en/x86_64/rpmforge/RPMS/rpmforge-release-0.5.3-1.el7.rf.x86_64.rpm
RUN yum install -y ./rpmforge-release-0.5.3-1.el7.rf.x86_64.rpm
RUN yum install -y tcping
RUN npm install

cmd ["node" , "index.js"]
