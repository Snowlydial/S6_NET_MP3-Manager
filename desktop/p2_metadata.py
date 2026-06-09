import os
import json
from dotenv import load_dotenv
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, ID3NoHeaderError

from shared.logger import initLogger
from shared.message_queue import consume, publish

load_dotenv()
queueIn = os.getenv("QUEUE_P1_TO_P2")
queueOut = os.getenv("QUEUE_P2_TO_P3")
logger = initLogger("P2_metadata")


def extractMetadata(filePath: str) -> dict:
    filename = os.path.basename(filePath)
    logger.info(f"Extracting metadata from: {filename}")

    try:
        audio = MP3(filePath)
        duration = int(audio.info.length)
    except Exception as e:
        logger.error(f"Could not read MP3 info for '{filename}': {e}")
        duration = None

    try:
        tags = ID3(filePath)
        title    = str(tags["TIT2"]) if "TIT2" in tags else None
        artist   = str(tags["TPE1"]) if "TPE1" in tags else None
        genre    = str(tags["TCON"]) if "TCON" in tags else None
        language = str(tags["TLAN"]) if "TLAN" in tags else None
        year     = str(tags["TDRC"]) if "TDRC" in tags else None
    except ID3NoHeaderError:
        logger.warning(f"No ID3 tags found in '{filename}', all metadata set to null")
        title = artist = genre = language = year = None

    return {
        "file_path": filePath,
        "title":     title or filename,
        "artist":   artist,
        "genre":    genre,
        "language": language,
        "duration": duration,
        "year":     year,
    }


def processMessage(message: str):
    logger.info("Message received from P1")

    try:
        filenameList = json.loads(message)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to deserialize P1 message: {e}")
        return

    enrichedList = [extractMetadata(f) for f in filenameList]
    logger.info(f"Metadata extracted for {len(enrichedList)} file(s), publishing to queue")

    try:
        publish(queueOut, json.dumps(enrichedList))
        logger.info(f"Message published to '{queueOut}'")
    except Exception as e:
        logger.error(f"Failed to publish to '{queueOut}': {e}")


if __name__ == "__main__":
    logger.info("P2 started, waiting for messages")
    consume(queueIn, processMessage)
