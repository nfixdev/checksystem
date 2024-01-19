if [-d ./documents/]; then
    echo "Documents status.....OK"
else
    mkdir documents
fi

if [-d ./tests/]; then
    echo "Tests status.........OK"
else
    mkdir tests
fi

export FULL_INIT_STARTUP=1

node server.js