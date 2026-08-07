#!/bin/bash
cd /home/z/my-project/standalone
fuser -k 3000/tcp 2>/dev/null
sleep 1
PORT=3000 node server.js &
sleep 3
curl -s -o /dev/null -w 'Status: %{http_code}\n' http://127.0.0.1:3000/pt-br/vagas