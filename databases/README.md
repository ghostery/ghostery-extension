# Tracker Databases
These database files are purposefully set to contain only dummy data. When the extension is built for production - at Ghostery headquarters - legitimate databases containing Ghostery's proprietary tracker data are bundled with the extension. These databases are also downloaded and used when the extension finds that the bundled databases are out of date (ie. a database exists on our server with a higher version number). That is why all the dummy files contain a version number of 0, to force an update.

## bugs.json
This file contains the schema for Ghostery's proprietary tracker database: the trackers, the identifying tracker patterns, and the list of first party exceptions. The dummy data in the included file contains trackers that demonstrate all of our matching methods: host, path, host and path, and regex. The file also includes an example for matching first party exceptions.

The version number is set to 0 to force an update when the extension is launched. To use this dummy database set the version to 999 to prevent an update on launch.

## click2play.json
This file contains the schema for Ghostery's proprietary click-to-play database. The dummy data is untested.

The version number is set to 0 to force an update when the extension is launched.

## compatibility.json
This file contains the schema for Ghostery's proprietary compatibility database. The dummy data is untested.

The version number is set to 0 to force an update when the extension is launched.

## surrogates.json
This file contains the schema for Ghostery's proprietary surrogate database. The dummy data is untested.

The version number is set to 0 to force an update when the extension is launched.
