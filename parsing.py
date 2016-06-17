"""
Parses addresses from eversource's list of unrepaired and repaired leaks.

Finds the latitude and longitude of said addresses, inserts them into tables
in datahub.csail.mit.edu

usage:
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
                 date_classified, date_repaired, grade, repo, table):
        super(Address, self).__init__()

        self.primary_key = int(primary_key)
        self.addr = addr
        self.town = town

        self.intersection = intersection
        if intersection is None:
            self.intersection = ''

        self.date_classified = None
        if date_classified and date_classified != '':
            self.date_classified = parser.parse(date_classified)

        self.date_repaired = None
        if date_repaired and date_classified != '':
            self.date_repaired = parser.parse(date_repaired)
        self.grade = int(grade)

        # the repo and table that this will be inserted into
        self.repo = repo
        self.table = table

    def get_details_for_address(self):
        """
        Uses the address, town, intersection attributes to lookup the location
        in google maps

        populates formatted_address, lat, lng, location_type
        """
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

    def insert_into_datahub(self):
        """ inserts the address into the appropriate table in datahub"""

        # do a little dance to make the date variable right
        date = None
        if self.date_classified:
            date = self.date_classified.date()
        elif self.date_repaired:
            date = self.date_repaired.date()

        # escape characters
        formatted_address = json.dumps(self.formatted_address)
        location_type = json.dumps(self.location_type)

        query = (
            "INSERT INTO %s.%s "
            "(id, formatted_address, lat, lng, "
            "location_type, record_date, grade) "
            "values (%d, '%s', %f, %f, '%s', "
            "to_date('%s', 'YYYY-MM-DD'), %d);"
            % (self.repo, self.table, self.primary_key,
                formatted_address, self.lat,
                self.lng, location_type, str(date), self.grade))

        try:
            res = self.__class__.datahub.query(REPO_BASE, self.repo, query)
            # print "%s: id %d" % (res['rows'][0]['status'], self.primary_key)
        except Exception:
            print ("Failed to insert row %d into %s.%s in datahub"
                   % (self.primary_key, self.repo, self.table))
            print res
            print '----'


def insert_csv_into_datahub(
        path, repo, table, classified_or_repaired, delimiter=','):
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
                point = Address(
                    primary_key=int(row[0]),
                    addr=row[1],
                    town=row[2],
                    intersection=row[3],
                    date_classified=date_classified,
                    date_repaired=date_repaired,
                    grade=int(row[5]),
                    repo=repo,
                    table=table)

                point.get_details_for_address()
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
        create table if not exists natural_gas.eversource_unrepaired_2014(
        id integer, formatted_address text, lat double precision,
        lng double precision, location_type text, record_date date,
        grade integer, PRIMARY KEY (id));"""
    dh.query(REPO_BASE, 'natural_gas', query)

    query = """
        create table if not exists natural_gas.eversource_unrepaired_2015(
        id integer, formatted_address text, lat double precision,
        lng double precision, location_type text, record_date date,
        grade integer, PRIMARY KEY (id));"""
    dh.query(REPO_BASE, 'natural_gas', query)

    query = """
        create table if not exists natural_gas.eversource_repaired_2014(
        id integer, formatted_address text, lat double precision,
        lng double precision, location_type text, record_date date,
        grade integer, PRIMARY KEY (id));"""
    dh.query(REPO_BASE, 'natural_gas', query)

    query = """
        create table if not exists natural_gas.eversource_repaired_2015(
        id integer, formatted_address text, lat double precision,
        lng double precision, location_type text, record_date date,
        grade integer, PRIMARY KEY (id));"""
    dh.query(REPO_BASE, 'natural_gas', query)

    print "Tables created.\n---"


print "Creating tables to be inserted into"
create_tables()

print "===\nINSERTING eversource_repaired_2015\n==="
insert_csv_into_datahub(path='data/2015_eversource_repaired.csv',
                        repo='natural_gas',
                        table='eversource_repaired_2015',
                        classified_or_repaired='repaired',
                        delimiter=',')

print "===\nINSERTING eversource_unrepaired_2015\n==="
insert_csv_into_datahub(path='data/2015_eversource_unrepaired.csv',
                        repo='natural_gas',
                        table='eversource_unrepaired_2015',
                        classified_or_repaired='unrepaired',
                        delimiter=',')

print "===\nINSERTING eversource_repaired_2014\n==="
insert_csv_into_datahub(path='data/2014_eversource_repaired.csv',
                        repo='natural_gas',
                        table='eversource_repaired_2014',
                        classified_or_repaired='repaired',
                        delimiter=',')

print "===\nINSERTING eversource_unrepaired_2014\n==="
insert_csv_into_datahub(path='data/2014_eversource_unrepaired.csv',
                        repo='natural_gas',
                        table='eversource_unrepaired_2014',
                        classified_or_repaired='unrepaired',
                        delimiter=',')
