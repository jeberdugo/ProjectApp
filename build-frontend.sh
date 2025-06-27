#!/bin/bash
cd frontend
npm install
npm run build
cd ..
mkdir -p src/main/resources/static
cp -r frontend/out/* src/main/resources/static/