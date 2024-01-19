@echo off
if not exist documents\ (
    mkdir documents
)

if not exist tests\ (
    mkdir tests
)

set FULL_INIT_STARTUP=1

node server.js
