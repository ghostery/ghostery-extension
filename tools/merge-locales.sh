#!/bin/bash
#
# Merge Cliqz language strings into Ghostery _locales
#
# Ghostery Browser Extension
# http://www.ghostery.com/
#
# Copyright 2019 Ghostery, Inc. All rights reserved.
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0

for lang in `ls ./cliqz/static/locale`
do
	# filter out only language folder
	if [ ! -d "./cliqz/static/locale/$lang" ]; then
		continue;
	fi

	# filter out language folders supported by ghostery
	if [ ! -d "_locales/$lang" ]; then
		continue;
	fi

	echo "Merging language file: $lang"
	jq -s '.[0] + .[1]' "cliqz/static/locale/$lang/messages.json" "_locales/$lang/messages.json" > "_locales/$lang/messages.temp.json"
	mv "_locales/$lang/messages.temp.json" "_locales/$lang/messages.json"
done
