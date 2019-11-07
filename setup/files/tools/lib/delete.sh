confirm() {
    # call with a prompt string or use a default
    read -r -p "${1:-Are you sure?} [y/N] " response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            true
            ;;
        *)
            false
            ;;
    esac
}

delete() {
  if [ -e "$1" ]; then
    if confirm "Are you sure you wish to recursively delete $1"; then
      rm -rf $1
      echo "deleted $1"
    fi
  else
    echo "$1 does not exist"
  fi
}
