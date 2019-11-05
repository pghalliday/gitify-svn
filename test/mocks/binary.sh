#!/bin/bash
echo $PWD
echo $@
if [ "$3" == "error" ]; then
  exit 1
fi

