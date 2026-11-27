setup:
    mise install
    pre-commit install
    ./exact.mjs contract types app.contract -o app.contract.d.ts

test:
    ./exact.mjs test web

verify:
    ./exact.mjs verify

check:
    ./exact.mjs contract build app.contract --json --errors-only
