#!/bin/bash

restart() {
	node index.js
	EXIT_CODE=$?

	if [ $EXIT_CODE -ne 67 ]; then
		restart
	else
		exit 0
	fi
}

trap 'exit 0' INT

restart