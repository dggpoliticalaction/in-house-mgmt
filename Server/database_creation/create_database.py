import sqlite3
from faker import Faker
import random

def create_database():
    conn = sqlite3.connect('dgg-crm.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS People
                 (did TEXT PRIMARY KEY,
                  name TEXT,
                  email TEXT,
                  phone TEXT )''') #did is for discord
    c.execute('''CREATE TABLE IF NOT EXISTS Groups
              (gid INTEGER PRIMARY KEY AUTOINCREMENT,
               name TEXT NOT NULL)''')
    c.execute('''CREATE TABLE IF NOT EXISTS VolunteerInGroups
              (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               did TEXT  NOT NULL,
               gid INTEGER,
               access_level INT NOT NULL,
               FOREIGN KEY (did) REFERENCES People(did),
               FOREIGN KEY (gid) REFERENCES Groups(gid))''') #access 1 = view, 2 = edit
    c.execute('''CREATE TABLE IF NOT EXISTS General_Role
              (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               did TEXT NOT NULL,
               access_level INT NOT NULL
              )''') #0 Needs approval, 1 normal organizer, 2 admin
    c.execute('''CREATE TABLE IF NOT EXISTS Event
              (eid INTEGER PRIMARY KEY AUTOINCREMENT,
               name TEXT NOT NULL,
               description TEXT,
               date TEXT,
               location TEXT,
               group_id INTEGER,
               FOREIGN KEY (group_id) REFERENCES Groups(gid))''')
    c.execute('''CREATE TABLE IF NOT EXISTS EventParticipants
              (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               eid INTEGER NOT NULL,
               did TEXT NOT NULL,
               FOREIGN KEY (eid) REFERENCES Event(eid),
               FOREIGN KEY (did) REFERENCES People(did))''')
    c.execute('''CREATE TABLE  IF NOT EXISTS Tags
              (tid INTEGER PRIMARY KEY AUTOINCREMENT,
               name TEXT NOT NULL)''')
    c.execute('''CREATE TABLE IF NOT EXISTS AssignedTags
              (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               did TEXT NOT NULL,
               tid INTEGER NOT NULL,
               FOREIGN KEY (did) REFERENCES People(did),
               FOREIGN KEY (tid) REFERENCES Tags(tid))''')
    c.execute('''CREATE TABLE IF NOT EXISTS Reaches(
              rid INTEGER PRIMARY KEY AUTOINCREMENT,
              status INTEGER NOT NULL,
              assigned TEXT,
              title TEXT NOT NULL,
              description TEXT NOT NULL,
              type TEXT NOT NULL,
              priority INTEGER NOT NULL,
              FOREIGN KEY (assigned) REFERENCES People(did))''') # type = asset, sof_dev, ally-reach
    c.execute('''CREATE TABLE IF NOT EXISTS VolunteerResponses(
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              rid INTEGER NOT NULL,
              did TEXT NOT NULL,
              response INT NOT NULL,
              FOREIGN KEY (did) REFERENCES People(did),
              FOREIGN KEY (rid) REFERENCES Reaches(rid))''') # 1 = accepted, 2 = rejected
    conn.commit()
    conn.close()


def populate_with_fake_data(num_people=50, num_groups=5, num_events=15, num_reaches=20):
    """
    Populate the database with fake data for testing.
    Only Tags will have real data: Dev-Software, Dev-Art, Community Building, Attendence
    """
    fake = Faker()
    conn = sqlite3.connect('dgg-crm.db')
    c = conn.cursor()

    # Insert REAL Tags
    real_tags = ['Dev-Software', 'Dev-Art', 'Community Building', 'Attendence']
    for tag in real_tags:
        c.execute('INSERT OR IGNORE INTO Tags (name) VALUES (?)', (tag,))
    conn.commit()

    # Get tag IDs
    c.execute('SELECT tid FROM Tags')
    tag_ids = [row[0] for row in c.fetchall()]

    # Generate fake People (using discord-like IDs)
    people_dids = []
    for _ in range(num_people):
        did = str(random.randint(100000000000000000, 999999999999999999))  # 18-digit discord ID
        name = fake.name()
        email = fake.email()
        phone = fake.phone_number()
        c.execute('INSERT OR IGNORE INTO People (did, name, email, phone) VALUES (?, ?, ?, ?)',
                  (did, name, email, phone))
        people_dids.append(did)
    conn.commit()

    # Generate fake Groups
    group_ids = []
    group_names = [fake.company() for _ in range(num_groups)]
    for name in group_names:
        c.execute('INSERT INTO Groups (name) VALUES (?)', (name,))
        group_ids.append(c.lastrowid)
    conn.commit()

    # Assign volunteers to groups with access levels
    for did in people_dids:
        # Each person joins 0-3 random groups
        num_groups_to_join = random.randint(0, min(3, len(group_ids)))
        selected_groups = random.sample(group_ids, num_groups_to_join)
        for gid in selected_groups:
            access_level = random.choice([1, 2])  # 1 = view, 2 = edit
            c.execute('INSERT OR IGNORE INTO VolunteerInGroups (did, gid, access_level) VALUES (?, ?, ?)',
                      (did, gid, access_level))
    conn.commit()

    # Assign General Roles to people
    for did in people_dids:
        # 0 = Needs approval, 1 = normal organizer, 2 = admin
        access_level = random.choices([0, 1, 2], weights=[10, 80, 10])[0]  # Most are normal organizers
        c.execute('INSERT INTO General_Role (did, access_level) VALUES (?, ?)', (did, access_level))
    conn.commit()

    # Generate fake Events
    event_ids = []
    for _ in range(num_events):
        name = fake.catch_phrase()
        description = fake.text(max_nb_chars=200)
        date = fake.date_time_between(start_date='-1y', end_date='+1y').isoformat()
        location = fake.address()
        group = random.choice(group_ids)
        c.execute('INSERT INTO Event (name, description, date, location, group_id) VALUES (?, ?, ?, ?, ?)',
                  (name, description, date, location, group))
        event_ids.append(c.lastrowid)
    conn.commit()

    # Assign Event Participants
    for eid in event_ids:
        # Each event has 5-20 random participants
        num_participants = random.randint(5, min(20, len(people_dids)))
        participants = random.sample(people_dids, num_participants)
        for did in participants:
            c.execute('INSERT OR IGNORE INTO EventParticipants (eid, did) VALUES (?, ?)', (eid, did))
    conn.commit()

    # Assign Tags to People
    for did in people_dids:
        # Each person gets 1-3 random tags
        num_tags = random.randint(1, min(3, len(tag_ids)))
        selected_tags = random.sample(tag_ids, num_tags)
        for tid in selected_tags:
            c.execute('INSERT OR IGNORE INTO AssignedTags (did, tid) VALUES (?, ?)', (did, tid))
    conn.commit()

    # Generate fake Reaches
    reach_ids = []
    reach_types = ['asset', 'sof_dev', 'ally-reach']
    for _ in range(num_reaches):
        status = random.randint(0, 3)  # 0-3 for different statuses
        assigned = random.choice(people_dids + [None])  # Some may be unassigned
        title = fake.sentence(nb_words=6)
        description = fake.text(max_nb_chars=300)
        reach_type = random.choice(reach_types)
        priority = random.randint(1, 5)  # 1 = highest, 5 = lowest
        c.execute('INSERT INTO Reaches (status, assigned, title, description, type, priority) VALUES (?, ?, ?, ?, ?, ?)',
                  (status, assigned, title, description, reach_type, priority))
        reach_ids.append(c.lastrowid)
    conn.commit()

    # Generate Volunteer Responses to Reaches
    for rid in reach_ids:
        # Each reach gets 0-10 volunteer responses
        num_responses = random.randint(0, min(10, len(people_dids)))
        responders = random.sample(people_dids, num_responses)
        for did in responders:
            response = random.choice([0, 1])  # 1 = accepted, 2 = rejected
            c.execute('INSERT OR IGNORE INTO VolunteerResponses (rid, did, response) VALUES (?, ?, ?)',
                      (rid, did, response))
    conn.commit()

    conn.close()
    print(f"Database populated with {num_people} people, {num_groups} groups, {num_events} events, and {num_reaches} reaches!")
    print(f"Real tags inserted: {', '.join(real_tags)}")


if __name__ == '__main__':
    # Create the database schema
    create_database()
    print("Database schema created successfully!")

    # Populate with fake data
    populate_with_fake_data(num_people=50, num_groups=5, num_events=15, num_reaches=20)
    print("Database ready for testing!")