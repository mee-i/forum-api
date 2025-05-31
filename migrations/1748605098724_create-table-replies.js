
exports.up = (pgm) => {
    pgm.createTable('replies', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        content: {
            type: 'TEXT',
            notNull: true,
        },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
            references: '"users"',
            onDelete: 'CASCADE',
        },
        date: {
            type: 'TIMESTAMPTZ',
            notNull: true,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('replies');
};
