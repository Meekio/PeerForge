from datetime import datetime

def validate_id(year):
    if year is None:
        return False
    return year >= datetime.now().year
