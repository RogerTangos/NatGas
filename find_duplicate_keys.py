'''
Takes a CSV and finds how many unique id values there are,
how many keys are seen more than once

seen.keys() = unique ids
duplicates.keys() = ids that appear more than once
'''
import csv

seen = {}
duplicates = {}
with open('data/ngrid/2014_ngrid_repaired.csv', 'rU+') as file:
    reader = csv.reader(file, delimiter=',')
    firstline = True
    for row in reader:
        if firstline:
            firstline = False
            continue
        myd = row[0]
        if seen.get(myd) is None:
            seen[myd] = True
        else:
            count = duplicates.get(myd, 1)
            duplicates[myd] = count + 1

print "Number of unque keys:"
print len(seen.keys())

print "Number of duplicate keys:"
print len(duplicates.keys())
