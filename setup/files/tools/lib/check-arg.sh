check_arg() {
  if [ -z "$1" ]; then
    echo "ERROR: $2"
    echo $3
    exit 1
  fi
}
