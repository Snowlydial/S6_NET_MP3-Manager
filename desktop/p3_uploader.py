import os
import json
import time
import requests
from dotenv import load_dotenv
from shared.logger import initLogger, logStep
from shared.message_queue import consume

load_dotenv()
queueIn = os.getenv("QUEUE_P2_TO_P3")
apiBaseUrl = os.getenv("API_BASE_URL")
MAX_ATTEMPTS = 5
RETRY_DELAY = 10  # seconds between retries
logger = initLogger("P3_uploader")


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

    logger.error(f"All {MAX_ATTEMPTS} attempts failed, skipping: {filename}")
    return False


def deleteLocalFile(song: dict):
    filePath = song["file_path"]
    filename = os.path.basename(filePath)
    try:
        os.remove(filePath)
        logger.info(f"Deleted local file: {filename}")
    except OSError as e:
        logger.error(f"Could not delete '{filename}': {e}")


def processSong(song: dict):
    success = uploadSong(song)
    if success:
        deleteLocalFile(song)
    else:
        logger.warning(f"Keeping local file due to failed upload: {os.path.basename(song['file_path'])}")


def processMessage(message: str):
    logStep(logger, 3, "UPLOAD")
    logger.info("Message received from P2")

    try:
        songList = json.loads(message)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to deserialize P2 message: {e}")
        return

    logger.info(f"Processing {len(songList)} file(s)")
    for song in songList:
        processSong(song)


if __name__ == "__main__":
    logger.info("P3 started, waiting for messages")
    consume(queueIn, processMessage)
