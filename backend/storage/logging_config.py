"""
This file configures logging for the backend APIs.
It sets up the logger for the database management and retrieval system (DBMRS)
and provides a logger object that can be used in other modules to log messages.
"""

import logging

# Create a logger
vtc_logger = logging.getLogger(__name__)
vtc_logger.setLevel(logging.DEBUG)  # Set logging level to DEBUG

# Define log format
formatter = logging.Formatter(
    "%(asctime)s - %(levelname)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
)

# Console handler (logs to terminal)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)  # Show DEBUG messages in console
console_handler.setFormatter(formatter)

# File handler (logs to a file)
file_handler = logging.FileHandler("app.log", mode="a")  # Append logs to 'app.log'
file_handler.setLevel(logging.DEBUG)  # Save DEBUG logs to file
file_handler.setFormatter(formatter)

# Add handlers to logger (avoid duplicate handlers)
if not vtc_logger.hasHandlers():
    vtc_logger.addHandler(console_handler)
    vtc_logger.addHandler(file_handler)
    vtc_logger.debug("Logging handlers added to vtc_logger.")
else:
    vtc_logger.debug("Logging handlers already exist for vtc_logger.")
