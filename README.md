If you want to use new signing certificate pairs, command to create certificates
    
    $ cd certs
    $ openssl req -x509 -newkey rsa:4096 -keyout signing_key.pem -out signing_cert.pem -nodes -days 900
