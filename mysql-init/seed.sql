INSERT INTO Roles (name, updatedAt)
VALUES
    ('Manager', CURRENT_TIMESTAMP),
    ('Cashier', CURRENT_TIMESTAMP);

INSERT INTO Users
    (name, username, email, password, roleId, updatedAt)
VALUES
    (
        'Abdilah',
        'admin',
        'maulananizhar27@gmail.com',
        '$2a$12$XL5ptDFyY0RIqYMFj.JlB.vaDtQK0Zd/IiPgiNNJc9KorrT7VpO9q',
        (SELECT roleId FROM Roles WHERE name = 'Manager'),
        CURRENT_TIMESTAMP
    );
