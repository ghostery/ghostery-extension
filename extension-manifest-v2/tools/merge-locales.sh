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
