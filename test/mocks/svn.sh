#!/bin/bash
echo $@
if [ "$2" == "error" ]; then
  exit 1
fi

