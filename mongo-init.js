db = db.getSiblingDB('closetbot');

db.createCollection('closetbot');

db.createUser(
    {
        user: "closetbot",
        pwd: "closetbot",
        roles: [
            {
                role: "readWrite",
                db: "closetbot"
            }
        ]
    }
)