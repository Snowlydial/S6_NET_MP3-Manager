import os
import json
import time
from dotenv import load_dotenv

from shared.logger import initLogger, logStep
from shared.message_queue import publish

load_dotenv()
musicDir = os.getenv("MUSIC_DIR")
watchInterval = int(os.getenv("WATCH_INTERVAL"))
queueToUse = os.getenv("QUEUE_P1_TO_P2")
logger = initLogger("P1_watcher")


def listTheMP3():
    files = os.listdir(musicDir)
    return [os.path.join(musicDir, f) for f in files if f.lower().endswith(".mp3")]

def pipeline():
    logStep(logger, 1, "WATCHER")
    mp3List = listTheMP3()
    
    if len(mp3List) > 0:
        logger.info(f"{len(mp3List)} MP3 file(s) found, attempting serialization to JSON")
        try:
            serialized = json.dumps(mp3List)
            logger.info("Serialization successful, publishing to queue")
            publish(queueToUse, serialized)
            logger.info(f"Message published to '{queueToUse}'")
        except Exception as e:
            logger.error(f"Failed during serialization or publish: {e}")
    else:
        logger.info("No MP3 file found")


def main():
    pipeline()
    
if __name__ == "__main__":
    logger.info("P1 started")
    while True:
        main()
        logger.info(f"Sleeping for {watchInterval}s")
        time.sleep(watchInterval)