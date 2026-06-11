import os
import logging

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGS_DIR = os.path.join(BASE_DIR, "..", "logs")
LOG_FILE = os.path.join(LOGS_DIR, "pipeline.log")

def initLogger(name: str):
    os.makedirs(LOGS_DIR, exist_ok=True)

    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")

        file_handler = logging.FileHandler(LOG_FILE)
        file_handler.setFormatter(formatter)

        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)

        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

    return logger


def logStep(logger: logging.Logger, step: int, name: str):
    for handler in logger.handlers:
        if isinstance(handler, logging.FileHandler):
            handler.stream.write(f"\n[STEP {step} - {name}]\n")
            handler.stream.flush()