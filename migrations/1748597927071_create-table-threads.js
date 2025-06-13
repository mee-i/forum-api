exports.up = (pgm) => {
  pgm.createTable('threads', {
    id: {
      type: 'VARCHAR(50)', primaryKey: true,
    },
    title: {
      type: 'TEXT', notNull: true,
    },
    body: {
      type: 'TEXT', notNull: true,
    },
    date: {
      type: 'TEXT',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('threads');
};
