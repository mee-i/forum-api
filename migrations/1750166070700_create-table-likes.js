exports.up = (pgm) => {
  pgm.createTable('likes', {
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"comments"',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    date: {
      type: 'TEXT',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP'),
    },
  });

  // Cegah duplicate like: 1 user hanya bisa like 1 kali ke 1 comment
  pgm.addConstraint('likes', 'unique_user_comment_like', {
    unique: ['user_id', 'comment_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('likes');
};
