import csv
import urllib
import requests
import collections
import json
import secret

def remove_excess_columns(path, delimiter=','):
    # Removes excess colums from files
    # path is relative to directory that the script is executed in
    # assumes that the first line indicates the number of columns desired

    # open with read/write and universal newline support
    with open(path, 'rU+') as file:
        reader = csv.reader(file, delimiter=delimiter)
        num_columns = None
        for row in reader:
            if reader.line_num == 1:
                num_columns = len(row)
                print('num_columns = %d' % num_columns)
            elif len(row) > num_columns:
                # too many columns in this row
                print('Too many columns in row %d' % reader.line_num)
                print(', '.join(row))
                # new_row = delimiter.join(row[0:num_columns])
                print('----')
            elif len(row) < num_columns:
                # too few columns in this row
                print('Too few columns in row %d' % reader.line_num)
                print(', '.join(row))
                print('----')

def get_details_for_address(addr_tuple):
    """
    accepts a named tuple with properties
    address, town, intersection, zip, lat, lng, address_type

    Uses the address, town, intersection fields to lookup the location in
    google maps

    populates lat, lng, address_type
    """
    addr_str_1 = "%s %s, MA" % (addr_tuple.address, addr_tuple.town)
    addr_str_2 = "%s %s %s, MA" % (
        addr_tuple.address, addr_tuple.intersection, addr_tuple.town)

    addr_str_1 = urllib.quote(addr_str_1)
    addr_str_2 = urllib.quote(addr_str_2)

    URI_1 = (
        'https://maps.googleapis.com/maps/api/geocode/json?'
        'address=%s' % addr_str_1)
    URI_2 = (
        'https://maps.googleapis.com/maps/api/geocode/json?'
        'address=%s' % addr_str_1)

    # Try the first URI
    res = requests.get(URI_1)
    content = json.loads(res.content)

    # If the first URI result isn't great, try again
    if content['results'][0].get('partial_match') is True:
        res_2 = requests.get(URI_2)
        content_2 = json.loads(res_2.content)

        if content_2['results'][0].get('partial_match') is True:
            # no good data found
            return
        # try address two

    print res.status_code

Addr = collections.namedtuple('Addr_tuple', ['address', 'town', 'intersection', 'zip', 'lat', 'lng', 'address_type'])
addr_tuple = Addr('45 Simpson Ave', 'somerville', None, None, None, None, None)
