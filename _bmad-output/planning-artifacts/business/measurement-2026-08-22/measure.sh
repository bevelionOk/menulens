#!/bin/zsh
set -u
# $S is a scratch folder with results/ and menus/: la-parra.pdf from `npx tsx server/scripts/sample-menu.ts`,
# german.pdf and no-prices.pdf from the heredoc in plan/guides/manual-test-guide.md (hostile set).
S=${S:-/tmp/menulens-measure}
REPO=/Users/pablojavier/dev/full-stack-challenge
DB=postgres://postgres:postgres@localhost:5433/menu_extraction
API=http://localhost:3100/api/runs
VOX='https://vox-restaurant.de/wp-content/uploads/2026/07/Vox-Speisekarte-Englisch-1.pdf'
cd $REPO/server
for m in gpt-5.6-luna gpt-5.6-terra; do
  echo "=== MODEL $m $(date +%T)"
  PORT=3100 DATABASE_URL=$DB OPENAI_MODEL=$m npx tsx --env-file-if-exists=../.env src/index.ts > $S/results/server-$m.log 2>&1 &
  PID=$!
  for i in {1..30}; do curl -s -o /dev/null $API && break; sleep 1; done
  run_one() {
    name=$1; shift
    id=$(curl -s "$@" $API | python3 -c 'import sys,json; print(json.load(sys.stdin).get("id",""))')
    echo "--- $name id=$id start=$(date +%T)"
    if [ -z "$id" ]; then echo "SUBMIT FAILED"; curl -s "$@" $API; echo; return; fi
    for i in {1..150}; do
      sleep 2
      st=$(curl -s $API/$id | python3 -c 'import sys,json; print(json.load(sys.stdin).get("status",""))')
      [ "$st" != "processing" ] && break
    done
    curl -s $API/$id > $S/results/$m--$name.json
    echo "    status=$st end=$(date +%T)"
  }
  run_one la-parra  -F file=@$S/menus/la-parra.pdf
  run_one german    -F file=@$S/menus/german.pdf
  run_one no-prices -F file=@$S/menus/no-prices.pdf
  run_one vox       -H 'content-type: application/json' -d "{\"url\":\"$VOX\"}"
  kill $PID; wait $PID 2>/dev/null
  sleep 1
done
echo "=== DONE $(date +%T)"
