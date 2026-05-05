from datetime import datetime

def validate_id(validity_year):

    current_year = datetime.now().year

    if validity_year is None:
        return False

    if validity_year >= current_year:
        return True

    return False