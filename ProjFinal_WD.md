# Projet sur 4j (each mercredi until 01/07/26)
App multi composant, Gestion MP3 + Generation de playlist

# Fonctionnalites:
Supposons que ce sont deux PC diff:
- un fait le traitement (3 programmes séparés)
- un qui genere playlist / gere les playlist

## App Desktop (not obligatory to be windowed, standalone allowed):
We have a directory for music on our PC (manually)
We have multi-programs:
- ONE that checks for new musics in the directory (only .mp3)
    - basically ignore anything aside from .mp3, every 5min?
    - return list of mp3
- SECOND that takes that list, keep listening:
    - extract the metadata from the mp3 (can use external libs for this)
    - for the "missing metadata" set to null
- THIRD that takes the list of mp3 (name+metadata)
    - Call API then send the mp3 and metadata to that API
    - Eventually, after sending via API to the server, we delete from the local
    - The API of P3 records the metadata and the path in DB
- ALL THREE must be logging they're stuff, like, log every action of each program: 
    - timestamp + action
    - if error+don't delete the file then retry, 
    - if success in one step then, 
    - if process

- Message blocker (aka Programmation par message):
    - Each programs can work Asynchronously, like they keep checking for a message that tells them 
    "Oh, I received a message, time for me to work"
        - P1 sends a message to P2
        - P2 listens for an eventual message (basically we don't do the linear call), then it sends a message to P3
        - P3 listens for the eventual P2 message
    - Each message have a different queue, P2 only reads for P1's message, P3 only reads for P2
    - Once they get the message, they execute the code that should be executed 

## App Web
- CRUD for MP3 (just in case, mais l'ajout de mp3 c'est manuel sur le PC avec desktop app)
- Interface de generation playlist
    - User uses criteria to generate (allow + not allow):
        - Duration max of the playlist
        - Artiste
        - Language
        - Genre
    - After generation following the criteria, we can still modify individually the songs in it afterward
    - User have a choice:
        - Play playlist on the web (pause, play)
        - Download playlist in ZIP format (with all the mp3)
- Web checks the DB to know the path of the song requested to be played

# Techno:
- You can do whichever you want (python, java, C#, react, etc...)
- He advises to diversify between the Desktop App and the Web App tho