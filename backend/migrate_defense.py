import sqlite3

conn = sqlite3.connect('zombie_platform.db')
cursor = conn.cursor()

# Get existing columns
cols = [row[1] for row in cursor.execute('PRAGMA table_info(api_endpoints)')]
print('Existing columns:', cols)

# Add new columns if they don't exist
if 'status' not in cols:
    cursor.execute('ALTER TABLE api_endpoints ADD COLUMN status TEXT DEFAULT "ACTIVE"')
    print('Added: status')

if 'blocked_at' not in cols:
    cursor.execute('ALTER TABLE api_endpoints ADD COLUMN blocked_at DATETIME')
    print('Added: blocked_at')

if 'blocked_reason' not in cols:
    cursor.execute('ALTER TABLE api_endpoints ADD COLUMN blocked_reason TEXT')
    print('Added: blocked_reason')

conn.commit()
conn.close()
print('Migration complete!')
