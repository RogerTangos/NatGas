"""
Parses addresses from ngrid's list of unrepaired and repaired leaks.

Finds the latitude and longitude of said addresses, inserts them into tables
in datahub.csail.mit.edu

preparation:
============
Create a file called secret.py:

GOOGLE_API_KEY = "" # for geolocation with google maps

username = "" # your datahub username
password = "" # your datahub password

# DataHub Oauth2 settings
# register a client app at
# https://datahub.csail.mit.edu/oauth2/applications/register/ with
# the client type "confidential", authorization grant type "password", and
# no redirect URIs.

client_id = " # your datahub OAuth2 client ID
client_secret = "" # your datahub OAuth2 Client Secret

# In DataHub, create a repo. This code assumes that it is named natural_gas.

usage:
======
$ python
>>> from parsing import *
"""

import csv
import urllib
import requests
import json
import secret

from dateutil import parser

from datahub import DataHub

REPO_BASE = 'al_carter'

# national grid shortcodes for cities and towns
NATIONAL_GRID_NAMES = {
    'ABI': 'Abington',
    'ACT': 'Acton',
    'AME': 'Amesbury',
    'ARL': 'arlington',
    'AYE': 'Ayer',
    'BAR': 'Barnstable Town',
    'BED': 'bedford',
    'BEL': 'belmont',
    'BEV': 'beverly',
    'BIL': 'Bellerica',
    'BOS': 'Boston',
    'BOU': 'bourne',
    'BOX': 'Boxborough',
    'BRA': 'Braintree',
    'BRE': 'Brewster',
    'BRI': 'brighton',
    'BRK': 'Brookfield',
    'BRO': 'Brookline',
    'BUR': 'burlington',
    'BUZ': 'buzzards bay',
    'BXF': 'Boxford',
    'CAR': 'Carlisle',
    'CHM': 'Chatham',
    'CEN': 'centerville',
    'CFD': 'Chelmsford',
    'CHA': 'charlestown',
    'CHE': 'Chelsea',
    'CLI': 'Clinton',
    'COH': 'cohasset',
    'CON': 'Concord',
    'COT': 'Cotuit',
    'DAN': 'danvers',
    'DEN': 'Dennis',
    'DEP': 'Dennis Port',
    'DOR': 'Dorchester',
    'DRA': 'dracut',
    'DUD': 'dudley',
    'DUN': 'Dunstable',
    'EBO': 'East Boston',
    'EBR': 'East Brookfield',
    'ESS': 'essex',
    'EVE': 'everett',
    'FAH': 'Fairhaven',
    'FAL': 'falmouth',
    'GEO': 'Georgetown',
    'GLO': 'gloucester',
    'GRO': 'Groton',
    'GVL': 'Groveland',
    'HAM': 'Hampden',
    'HAR': 'Harvard',
    'HAV': 'Haverhill',
    'HIN': 'hingham',
    'HUL': 'Hull',
    'HWH': 'Harwich',
    'HYA': 'hyannis',
    'IPS': 'ipswich',
    'JPL': 'Jamaica Plain',
    'LEI': 'Leicester',
    'LEO': 'Leominster',
    'LEX': 'lexington',
    'LIN': 'Lincoln',
    'LIT': 'Littleton',
    'LNF': 'Lynnfield',
    'LNN': 'Lynn',
    'LOW': 'Lowell',
    'MAL': 'Malden',
    'MAM': 'Marston Mills',
    'MAN': 'Manchester',
    'MAR': 'Marblehead',
    'MAS': 'Mashpee',
    'MED': 'Medford',
    'MEL': 'melrose',
    'MER': 'Merrimac',
    'MID': 'Middletown',
    'MIL': 'Milton',
    'MOB': 'Mounument Beach',
    'NAH': 'nahant',
    'NBR': 'New Bedford',
    'NEW': 'Newton',
    'NOR': 'Norwood',
    'NWB': 'Newburyport or Newbury',
    'ORL': 'Orleans',
    'OST': 'Osterville',
    'PEA': 'Peabody',
    'PEP': 'Pepperell',
    'POC': 'Pocasset',
    'QUI': 'Quincy',
    'RDG': 'Reading',
    'REV': 'Revere',
    'ROC': 'Rockland',
    'ROS': 'Roslindale',
    'ROX': 'Roxbury',
    'SAL': 'Salem',
    'SAU': 'Saugus',
    'SAN': 'Sandwich',
    'SBO': 'South Boston',
    'SLB': 'Salisbury',
    'SOM': 'Somerville',
    'TEW': 'Tewksbury',
    'TOP': 'Topsfield',
    'TYN': 'Tyngsborough',
    'WAK': 'wakefield',
    'WAL': 'Waltham',
    'PAB': 'Wareham',
    'WAR': 'Wareham',
    'WAT': 'Watertown',
    'WAY': 'wayland',
    'WEB': 'Webster',
    'WEL': 'Wellesley',
    'WEN': 'Wenham',
    'WES': 'Westminster',
    'WHA': 'West Harwich',
    'WES': 'weston',
    'WEY': 'Weymouth',
    'WHI': 'Whitman',
    'WCH': 'Winchester',
    'WFD': 'Westford',
    'WIL': 'Wilmington',
    'WNT': 'Winthrop',
    'WOB': 'Woburn',
    'WRO': 'West Roxbury',
    'YAR': 'Yarmouth'}

# ID's of rows that we don't want geocoded/inserted
# This is used when we're repairing a partial insert into a table
# or just checking on a subset of the data
IDS = []


class Address(object):
    """
    Class for storing unprocessed and processed information about a gas leak.
    """

    # class level variable for datahub connector
    datahub = DataHub(client_id=secret.client_id,
                      client_secret=secret.client_secret,
                      grant_type='password',
                      username=secret.username,
                      password=secret.password)

    def __init__(self, primary_key, addr, town, intersection,
                 date_classified, date_repaired, grade, repo, table,
                 national_grid=False):
        super(Address, self).__init__()

        self.primary_key = int(primary_key)
        self.addr = addr
        self.town = town

        if national_grid:
            self.town = NATIONAL_GRID_NAMES.get(town.upper().strip(), town)

        self.intersection = intersection
        if intersection is None:
            self.intersection = ''
        elif national_grid:
            self.intersection = 'and ' + intersection

        self.date_classified = None
        if date_classified and date_classified != '':
            self.date_classified = parser.parse(date_classified)

        self.date_repaired = None
        if date_repaired and date_classified != '':
            self.date_repaired = parser.parse(date_repaired)

        # sometimes something strange will get passed in for grade
        try:
            self.grade = int(grade)
        except:
            self.grade = 0

        # the repo and table that this will be inserted into
        self.repo = repo
        self.table = table

    def get_details_for_address(self):
        """
        Uses the address, town, intersection attributes to lookup the location
        in google maps

        populates formatted_address, lat, lng, location_type
        """
        addr_str = ""

        if self.addr[0].isdigit():
            addr_str = "%s %s, MA" % (
                self.addr, self.town)
        else:
            addr_str = "%s %s %s, MA" % (
                self.addr, self.intersection, self.town)

        addr_str = urllib.quote(addr_str)

        URI = (
            'https://maps.googleapis.com/maps/api/geocode/json?'
            'address=%s&key=%s' % (addr_str, secret.GOOGLE_API_KEY))

        res = requests.get(URI)
        content = json.loads(res.content)
        status = content['status']

        if status == 'OVER_QUERY_LIMIT':
            raise Exception('API is over query limit')
        elif (status == 'ZERO_RESULTS') or (status == 'INVALID_REQUEST'):
            print '%s is invalid. Skipping' % addr_str
        elif status == 'OK' and len(content.get('results', [])) > 0:
            # extract some variables
            result = content['results'][0]
            self.formatted_address = result['formatted_address']
            self.lat = result['geometry']['location']['lat']
            self.lng = result['geometry']['location']['lng']
            self.location_type = result['geometry']['location_type']

    def get_query_values(self):
        """
        the values part of the insert statement.

        It's useful to have it broken up, because that enables batch inserts.
        """

        # do a little dance to make the date variable right
        date = None
        if self.date_classified:
            date = self.date_classified.date()
        elif self.date_repaired:
            date = self.date_repaired.date()

        # escape quotations
        formatted_address = json.dumps(self.formatted_address)
        location_type = json.dumps(self.location_type)

        values = ("(%d, '%s', %f, %f, '%s',"
                  "to_date('%s', 'YYYY-MM-DD'), %d) "
                  % (self.primary_key, formatted_address, self.lat,
                      self.lng, location_type, str(date), self.grade))

        return values

    def get_query_insert(self):
        insert = (
            "INSERT INTO %s.%s "
            "(id, formatted_address, lat, lng, "
            "location_type, record_date, grade) "
            % (self.repo, self.table))

        return insert

    def insert_into_datahub(self):
        """ inserts the address into the appropriate table in datahub"""

        query = self.get_query_insert() + " values " + self.get_query_values()

        try:
            res = self.__class__.datahub.query(REPO_BASE, self.repo, query)
            # print "%s: id %d" % (res['rows'][0]['status'], self.primary_key)
        except Exception:
            print ("Failed to insert row %d into %s.%s in datahub"
                   % (self.primary_key, self.repo, self.table))
            print res
            print '----'


def insert_csv_into_datahub(
        path, repo, table, classified_or_repaired, delimiter=',',
        national_grid=False):
    """
    inserts the presented csv file path into a datahub repo and table

    assumes a header row is present
    """
    # open with read/write and universal newline support
    with open(path, 'rU+') as file:
        reader = csv.reader(file, delimiter=delimiter)

        firstline = True
        for row in reader:

            if firstline:
                firstline = False
                continue

            # make sure that we get the classified/repaired thing correct
            date_repaired = row[4]
            date_classified = None
            if classified_or_repaired == 'classified':
                date_classified = row[4]
                date_repaired = None

            # actually create the points and insert them into the table
            # If an exception occurs, log it and move on. The data is probably
            # corrupt in some way
            try:

                myd = int(row[0])
                if myd not in IDS:
                    point = Address(
                        primary_key=int(row[0]),
                        addr=row[1],
                        town=row[2],
                        intersection=row[3],
                        date_classified=date_classified,
                        date_repaired=date_repaired,
                        grade=row[5],
                        repo=repo,
                        table=table,
                        national_grid=national_grid)

                    point.get_details_for_address()
                    print point.formatted_address
                    point.insert_into_datahub()
            except Exception as e:
                print "Failed to insert row %s in file %s" % (row[0], path)
                print row
                print e
                print '----'


def create_tables():
    """ creates tables to be inserted into"""

    dh = DataHub(client_id=secret.client_id,
                 client_secret=secret.client_secret,
                 grant_type='password',
                 username=secret.username,
                 password=secret.password)

    query = """
        create table if not exists natural_gas.ngrid_repaired_2015(
        id integer, formatted_address text, lat double precision,
        lng double precision, location_type text, record_date date,
        grade integer, PRIMARY KEY (id));"""
    dh.query(REPO_BASE, 'natural_gas', query)

    query = """
        create table if not exists natural_gas.ngrid_unrepaired_2015(
        id integer, formatted_address text, lat double precision,
        lng double precision, location_type text, record_date date,
        grade integer, PRIMARY KEY (id));"""
    dh.query(REPO_BASE, 'natural_gas', query)

    query = """
        create table if not exists natural_gas.ngrid_unrepaired_2014(
        id integer, formatted_address text, lat double precision,
        lng double precision, location_type text, record_date date,
        grade integer, PRIMARY KEY (id));"""
    dh.query(REPO_BASE, 'natural_gas', query)

    query = """
        create table if not exists natural_gas.ngrid_repaired_2014(
        id integer, formatted_address text, lat double precision,
        lng double precision, location_type text, record_date date,
        grade integer, PRIMARY KEY (id));"""
    dh.query(REPO_BASE, 'natural_gas', query)

    # print "Tables created.\n---"


print "Creating tables to be inserted into"
# create_tables()

print "===\nINSERTING ngrid_repaired_2015\n==="
insert_csv_into_datahub(path='data/ngrid/2015_ngrid_repaired.csv',
                        repo='natural_gas',
                        table='ngrid_repaired_2015',
                        classified_or_repaired='repaired',
                        delimiter=',',
                        national_grid=True)

print "===\nINSERTING ngrid_unrepaired_2015\n==="
insert_csv_into_datahub(path='data/ngrid/2015_ngrid_unrepaired.csv',
                        repo='natural_gas',
                        table='ngrid_unrepaired_2015',
                        classified_or_repaired='unrepaired',
                        delimiter=',',
                        national_grid=True)

print "===\nINSERTING ngrid_repaired_2014\n==="
insert_csv_into_datahub(path='data/ngrid/2014_ngrid_repaired.csv',
                        repo='natural_gas',
                        table='ngrid_repaired_2014',
                        classified_or_repaired='repaired',
                        delimiter=',',
                        national_grid=True)

print "===\nINSERTING ngrid_unrepaired_2014\n==="
insert_csv_into_datahub(path='data/ngrid/2014_ngrid_unrepaired.csv',
                        repo='natural_gas',
                        table='ngrid_unrepaired_2014',
                        classified_or_repaired='unrepaired',
                        delimiter=',',
                        national_grid=True)

# print "===\nINSERTING eversource_repaired_2015\n==="
# insert_csv_into_datahub(path='data/eversource/2015_eversource_repaired.csv',
#                         repo='natural_gas',
#                         table='eversource_repaired_2015',
#                         classified_or_repaired='repaired',
#                         delimiter=',')

# print "===\nINSERTING eversource_unrepaired_2015\n==="
# insert_csv_into_datahub(path='data/eversource/2015_eversource_unrepaired.csv',
#                         repo='natural_gas',
#                         table='eversource_unrepaired_2015',
#                         classified_or_repaired='unrepaired',
#                         delimiter=',')

# print "===\nINSERTING eversource_repaired_2014\n==="
# insert_csv_into_datahub(path='data/eversource/2014_eversource_repaired.csv',
#                         repo='natural_gas',
#                         table='eversource_repaired_2014',
#                         classified_or_repaired='repaired',
#                         delimiter=',')

# print "===\nINSERTING eversource_unrepaired_2014\n==="
# insert_csv_into_datahub(path='data/eversource/2014_eversource_unrepaired.csv',
#                         repo='natural_gas',
#                         table='eversource_unrepaired_2014',
#                         classified_or_repaired='unrepaired',
#                         delimiter=',')




# Test Code

# address = Address(
#     primary_key=1,
#     addr='OAK GROVE CT',
#     town='MALDEN',
#     intersection='WASHINGTON ST',
#     date_classified=None,
#     date_repaired='3/10/2015',
#     grade='1',
#     repo='natural_gas',
#     table='ngrid_repaired_2015')

# address.get_details_for_address()
# import pdb; pdb.set_trace()
# print address.get_query_insert() + " values " + address.get_query_values()
