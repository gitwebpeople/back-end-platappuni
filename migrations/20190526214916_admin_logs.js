exports.up = function (knex, Promise) {
  return knex.schema.createTable('admin_logs', table => {
    table.increments('id').primary()
    table.integer('userId').unsigned()
      .index()
      .references('id')
      .inTable('customers')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
    table.string('activity').notNull()
    table.string('ip').notNull()
    table.date('date').notNull()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('update_at').defaultTo(knex.fn.now())
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('admin_logs')
}
