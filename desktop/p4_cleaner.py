import os
import json
from dotenv import load_dotenv
from shared.logger import initLogger, logStep
from shared.message_queue import consume

load_dotenv()
queueIn = os.getenv("QUEUE_P3_TO_P4")
logger = initLogger("P4_cleaner")


def deleteFile(filePath: str):
    filename = os.path.basename(filePath)
    try:
        os.remove(filePath)
        logger.info(f"Deleted: {filename}")
    except OSError as e:
        logger.error(f"Could not delete '{filename}': {e}")


def processMessage(message: str):
    logStep(logger, 4, "CLEANER")
    logger.info("Message received from P3")

    try:
        uploadedPaths = json.loads(message)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to deserialize P3 message: {e}")
        return

    logger.info(f"Deleting {len(uploadedPaths)} file(s)")
    for filePath in uploadedPaths:
        deleteFile(filePath)


if __name__ == "__main__":
    logger.info("P4 started, waiting for messages")
    consume(queueIn, processMessage)
