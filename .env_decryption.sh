#!/bin/bash
echo "Please enter password to decrypt environment variables"
read password

for DIR in *;
    do (cd $DIR 2> /dev/null &&\
     openssl enc -d -aes256 -in .env.enc -out .env -pass pass:$password 2> /dev/null &&\
     cd ..);
done
echo "DONE"