if [not -d ./json/ ]; then
    git https://github.com/nlohmann/json.git
    cd json
    cp ./single_include/nlohmann/json.hpp ./
fi

make