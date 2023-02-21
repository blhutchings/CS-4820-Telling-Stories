# If the editor and core files are missing, we download them from GitHub.
if [ ! -d "h5p/editor" ] || [ ! -d "h5p/core" ]
then    
    sh scripts/download-core.sh c79f97a16fd8c6fc0232c10d5bed5b94502ee9e9 c886fa6ded498bbe0148e9484f9b1534facc264e
else
    echo "Not downloading H5P Core and Editor files as they are already present!"
fi
