#!/bin/bash

restart() {
	node index.js
	EXIT_CODE=$?

	restart
}

trap 'exit 0' INT

restart