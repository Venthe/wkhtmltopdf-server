#!/usr/bin/env bash

set -o pipefail
set -o errexit

function build() {
    npm ci && docker build --tag "venthe/wkhtmltopdf:latest" --tag "venthe/wkhtmltopdf:${1:-0.0.1}" .
}

function run() {
    function dev() {
        docker run -it --rm -p 3000:3000 \
            -v "./src:/server/src:ro" \
            "venthe/wkhtmltopdf:${1:-latest}"
    }

    function test() {
        docker run -it --rm -p 3000:3000 \
            "venthe/wkhtmltopdf:${1:-latest}"
    }

    "${@:-1}"
}

function test() {
    function 1() {
        curl --request POST http://localhost:3000 --data '{"url": "http://localhost:3000/selftest"}' -H "Content-Type: application/json" > ./out/test1.pdf
    }

    function 2() {
        curl --request POST http://localhost:3000 -F "configuration=@./test/1/configuration.json;type=application/json" > ./out/test2.pdf
    }

    function 3() {
        curl --request POST http://localhost:3000 -F "configuration=@./test/2/configuration.json;type=application/json" -F "files[]=@./test/2/style.css;type=text/css" -F "files[]=@./test/2/style.css;type=text/css" > ./out/test3.pdf
    }

    function 4() {
        curl --request GET http://localhost:3000/?url=http://localhost:3000/selftest > ./out/test4.pdf
    }

    function 5() {
        curl --request GET "http://localhost:3000/?url=http://localhost:3000/selftest&aaa=bbb"  > ./out/test5.json
    }

    function all() {
        1
        2
        3
        4
        5
    }

    "${@:-1}"
}


"${@}"