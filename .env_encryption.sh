#!/bin/bash
echo "Please enter password to encrypt environment variables"
read password

for DIR in *;
    do (cd $DIR 2> /dev/null &&\
     openssl enc -aes256 -in .env -out .env.enc -pass pass:$password 2> /dev/null &&\
      cd ..);
done
echo "DONE"