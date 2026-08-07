#!/bin/bash
fuser -k 3000/tcp 2>/dev/null
sleep 1
cd /home/z/my-project/standalone
PORT=3000 node server.js > /tmp/nxserver.log 2>&1 &
SRVPID=$!
echo $SRVPID > /tmp/nxserver.pid
echo "Starting server PID=$SRVPID..."
sleep 4

if kill -0 $SRVPID 2>/dev/null; then
  echo "SERVER_OK" > /tmp/nxtest.txt
else
  echo "SERVER_FAILED" > /tmp/nxtest.txt
  cat /tmp/nxserver.log >> /tmp/nxtest.txt
  exit 1
fi

echo "" >> /tmp/nxtest.txt
echo "=== Route Tests ===" >> /tmp/nxtest.txt
for route in \
  '/pt-br/vagas' \
  '/en/jobs' \
  '/es/empleos' \
  '/fr/emplois' \
  '/de/stellenangebote' \
  '/zh/职位' \
  '/pt-br/vagas/europa' \
  '/pt-br/vagas/asia' \
  '/pt-br/vagas/eua' \
  '/pt-br/vagas/europa/portugal' \
  '/en/jobs/europa/germany' \
  '/en/jobs/asia/india' \
  '/en/jobs/eua/united-states' \
  '/en/jobs/asia/japao' \
  '/en/jobs/europa/remoto-global' \
  '/en/jobs/asia/remoto-global'; do
  result=$(curl -s -o /dev/null -w '%{http_code} %{size_download}' "http://127.0.0.1:3000$route")
  echo "$route -> $result" >> /tmp/nxtest.txt
done

echo "" >> /tmp/nxtest.txt
echo "=== Data Files ===" >> /tmp/nxtest.txt
for f in countries.json latest_20.json europa_portugal.json asia_india.json eua_united-states.json; do
  result=$(curl -s -o /dev/null -w '%{http_code} %{size_download}' "http://127.0.0.1:3000/data/$f")
  echo "$f -> $result" >> /tmp/nxtest.txt
done

echo "" >> /tmp/nxtest.txt
echo "=== Content Check ===" >> /tmp/nxtest.txt
HOMEPAGE=$(curl -s http://127.0.0.1:3000/pt-br/vagas)
echo "Homepage size: ${#HOMEPAGE} bytes" >> /tmp/nxtest.txt
echo "Has 'Ache Aqui': $(echo $HOMEPAGE | grep -c 'Ache Aqui')" >> /tmp/nxtest.txt
echo "Has 'CRITECNIC': $(echo $HOMEPAGE | grep -c 'CRITECNIC')" >> /tmp/nxtest.txt
echo "Has 'Work Versaly': $(echo $HOMEPAGE | grep -c 'Work Versaly')" >> /tmp/nxtest.txt
echo "Has '45.039': $(echo $HOMEPAGE | grep -c '45.039')" >> /tmp/nxtest.txt
echo "Has 'vagas de tecnologia': $(echo $HOMEPAGE | grep -c 'vagas de tecnologia')" >> /tmp/nxtest.txt

echo "DONE" >> /tmp/nxtest.txt
echo "Test results written to /tmp/nxtest.txt"