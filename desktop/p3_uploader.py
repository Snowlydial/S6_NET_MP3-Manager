import os
import json
import time
import requests
from dotenv import load_dotenv
from shared.logger import initLogger, logStep
from shared.message_queue import consume, publish

load_dotenv()
queueIn  = os.getenv("QUEUE_P2_TO_P3")
queueOut = os.getenv("QUEUE_P3_TO_P4")
apiBaseUrl = os.getenv("API_BASE_URL")
MAX_ATTEMPTS = 5
RETRY_DELAY = 10  # seconds between retries
logger = initLogger("P3_uploader")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def loadBlacklist() -> dict:
    path = os.path.join(BASE_DIR, "blacklist.json")
    if not os.path.exists(path):
        logger.warning("blacklist.json not found, no blacklisting applied")
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def isBlacklisted(song: dict, blacklist: dict) -> bool:
    for field, bannedValues in blacklist.items():
        songValue = song.get(field)
        if songValue is None:
            continue
        for banned in bannedValues:
            if songValue.lower() == banned.lower():
                return True
    return False

BLACKLIST = loadBlacklist()
logger.info(f"Blacklist loaded: {BLACKLIST}")


def uploadSong(song: dict) -> bool:
    filePath = song["file_path"]
    filename = os.path.basename(filePath)

    if not os.path.exists(filePath):
        logger.warning(f"File not found, skipping: {filename}")
        return False

    for attempt in range(1, MAX_ATTEMPTS + 1):
        logger.info(f"Uploading '{filename}' (attempt {attempt}/{MAX_ATTEMPTS})")
        try:
            with open(filePath, "rb") as f:
                response = requests.post(
                    f"{apiBaseUrl}/songs/upload",
                    files={"file": (filename, f, "audio/mpeg")},
                    data={
                        "title":    song.get("title") or "",
                        "artist":   song.get("artist") or "",
                        "albumArtist": song.get("albumArtist") or "",
                        "genre":    song.get("genre") or "",
                        "language": song.get("language") or "",
                        "duration": song.get("duration") or 0,
                        "year":     song.get("year") or "",
                    }
                )

            if response.status_code in (200, 201):
                logger.info(f"Upload successful: {filename}")
                return True
            else:
                logger.warning(f"API returned {response.status_code}: {response.text}")

        except requests.RequestException as e:
            logger.error(f"Request failed (attempt {attempt}): {e}")

        if attempt < MAX_ATTEMPTS:
            logger.info(f"Retrying in {RETRY_DELAY}s...")
            time.sleep(RETRY_DELAY)

    logger.error(f"All {MAX_ATTEMPTS} attempts failed, keeping local file: {filename}")
    return False


def processMessage(message: str):
    logStep(logger, 3, "UPLOAD")
    logger.info("Message received from P2")

    try:
        songList = json.loads(message)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to deserialize P2 message: {e}")
        return

    logger.info(f"Processing {len(songList)} file(s)")
    uploadedPaths = []

    for song in songList:
        if isBlacklisted(song, BLACKLIST):
            logger.warning(f"Blacklisted, skipping: {song['title']}")
            continue

        success = uploadSong(song)
        if success:
            uploadedPaths.append(song["file_path"])

    if uploadedPaths:
        publish(queueOut, json.dumps(uploadedPaths))
        logger.info(f"{len(uploadedPaths)} uploaded file(s) sent to P4 for deletion")
    else:
        logger.info("No successful uploads, nothing sent to P4")


if __name__ == "__main__":
    logger.info("P3 started, waiting for messages")
    consume(queueIn, processMessage)
