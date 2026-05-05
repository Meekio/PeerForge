from datetime import datetime

def validate_id(year):

    if year is None:
        return False

    current_year = datetime.now().year

    return year >= current_year