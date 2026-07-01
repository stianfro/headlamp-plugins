set shell := ["bash", "-uc"]

plugin := "kubevirt"

install:
    npm ci --prefix {{plugin}}

tsc:
    cd {{plugin}} && npx headlamp-plugin tsc

lint:
    cd {{plugin}} && npx headlamp-plugin lint

lint-fix:
    cd {{plugin}} && npx headlamp-plugin lint --fix

test:
    cd {{plugin}} && npx headlamp-plugin test

build:
    cd {{plugin}} && npx headlamp-plugin build

package:
    rm -f {{plugin}}/{{plugin}}-*.tar.gz
    cd {{plugin}} && npx headlamp-plugin package

image-build image="headlamp-plugin-kubevirt" tag="dev":
    docker build -f Dockerfile.plugins -t {{image}}:{{tag}} .

image-push image="headlamp-plugin-kubevirt" tag="dev":
    docker push {{image}}:{{tag}}

storybook-build:
    cd {{plugin}} && npx headlamp-plugin storybook-build

yaml:
    @files=$(find . -path './{{plugin}}/node_modules' -prune -o -type f \( -name '*.yml' -o -name '*.yaml' \) -print); if [ -n "$files" ]; then yq eval '.' $files >/dev/null; fi

ci: yaml lint tsc test build package
