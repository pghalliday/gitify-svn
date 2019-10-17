#!/bin/bash
echo $@
if [ "$5" == "error" ]; then
  exit 1
fi

