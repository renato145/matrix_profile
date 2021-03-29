#!/bin/bash
# For some reason some built files are not in the correct directories :S
cd build
mkdir -p static/js/static/js
cp *.wasm static/js/
cp static/js/*.chunk.worker.js* static/js/static/js/
