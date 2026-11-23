import re
import shlex

_SEGMENT_SPLIT = re.compile(r"&&|\|\||[;&|\n\r()]")
_ENV_ASSIGNMENT = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*=")


class CommandNotAllowed(ValueError):
    pass


def _is_sudo(token: str) -> bool:
    return token.rsplit("/", 1)[-1] == "sudo"


def ensure_command_allowed(command: str) -> str:
    command = command.strip()
    if not command:
        raise CommandNotAllowed("Command cannot be empty.")

    for segment in _SEGMENT_SPLIT.split(command):
        segment = segment.strip()
        if not segment:
            continue
        try:
            tokens = shlex.split(segment, posix=True)
        except ValueError:
            tokens = segment.split()
        index = 0
        while index < len(tokens) and _ENV_ASSIGNMENT.match(tokens[index]):
            index += 1
        if index < len(tokens) and _is_sudo(tokens[index]):
            raise CommandNotAllowed("Commands that start with sudo are not allowed.")

    return command
