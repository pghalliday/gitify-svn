#!/bin/bash

set -e

DIR="$(dirname "$(readlink -f "$0")")"
cd $DIR/end-to-end/working
../../bin/index.js -l debug -u admin -p password
