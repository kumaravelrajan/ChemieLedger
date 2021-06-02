db.createUser(
    {
        user: "rohstoffboerse",
        pwd: "rohstoffboerse",
        roles: [
            {role: "readWrite", db: "rohstoffboerse"},
            "readWrite"
        ]
    }
)