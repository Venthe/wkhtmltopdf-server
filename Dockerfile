FROM docker.io/library/ubuntu:mantic-20231011
WORKDIR /workdir
# ADD https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-2/wkhtmltox_0.12.6.1-2.jammy_amd64.deb /usr/bin/wkhtmltopdf

RUN apt-get update && \
    apt-get install -y ca-certificates curl gnupg && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install nodejs -y && \
    curl -sLO https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-2/wkhtmltox_0.12.6.1-2.jammy_amd64.deb && \
    (dpkg -i wkhtmltox_0.12.6.1-2.jammy_amd64.deb || true) && apt-get -f install -y && rm wkhtmltox_0.12.6.1-2.jammy_amd64.deb && \
    apt-get clean

ADD ./ ./

ENTRYPOINT ["node"]
CMD ["."]