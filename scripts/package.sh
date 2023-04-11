#!/bin/bash

OUT_DIR=./ocr-reader
mv ./.next/standalone $OUT_DIR
mv ./.next/static $OUT_DIR/.next
mkdir -p $OUT_DIR/data
mv ./public $OUT_DIR
cp ./scripts/start.* $OUT_DIR
cp ./README.md $OUT_DIR
zip -r ./ocr-reader.zip $OUT_DIR
