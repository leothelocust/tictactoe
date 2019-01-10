# TicTacToe API Interface
A Golang Server that opens a unique socket for two users to play TicTacToe online.

## Firewall
    sudo ufw status
    sudo ufw allow OpenSSH
    sudo ufw allow https
    sudo ufw enable

## Install Go

    curl -C - https://dl.google.com/go/go1.11.4.linux-amd64.tar.gz -o go1.11.4.linux-amd64.tar.gz
    tar -C /usr/local -xzf go1.11.4.linux-amd64.tar.gz
    echo "export PATH=$PATH:/usr/local/go/bin"
    go version

## Letsencrypt
    sudo add-apt-repository ppa:certbot/certbot
    sudo apt-get update
    sudo apt-get install python-certbot-nginx
    certbot certonly --standalone -d weather.l3vi.co

## Systemd
    sudo cp tictactoe-api.service /lib/systemd/system/.
    ls -al /lib/systemd/system
    sudo chmod 755 /lib/systemd/system/tictactoe-api.service

    sudo systemctl enable tictactoe-api.service
    sudo systemctl start tictactoe-api.service
    sudo journalctl -f -u tictactoe-api

    # or

    sudo systemctl status tictactoe-api.service
