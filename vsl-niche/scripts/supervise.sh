#!/usr/bin/env bash
# Run the render queue and the pipeline queue together; stop both if this is stopped.
cd "$(dirname "$0")/.."
trap 'kill 0' TERM INT EXIT
bash scripts/queue.sh >> build/queue.log 2>&1 &
bash build/pipeq.sh >> build/pipeq.log 2>&1 &
wait
