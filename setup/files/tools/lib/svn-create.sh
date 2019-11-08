create() {
  if [ -e "$1" ]; then
    echo "$1 already exists"
    false
  else
    svnadmin create $1
    chown -R www-data:www-data $1
    chmod -R 775 $1
    true
  fi
}
