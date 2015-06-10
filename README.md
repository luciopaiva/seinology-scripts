# Seinology Crawler

Crawler to fetch all Seinfeld scripts from [www.seinology.com](www.seinology.com). Scripts will be downloaded to `../scripts/`
with a filename following the pattern `script-<index>.txt`.

## How to Run

    mkdir -p scripts
    git clone git@github.com:luciopaiva/seinology-scripts.git
    cd seinology-scripts
    npm install
    node crawler
