exports.up = function(knex, Promise) {
    return knex.schema.createTable("ticket", table => {
      table.increments("id").primary();
      table.string("cnpjcpf").unsigned()
            .index()
            .references("cnpjcpf")
            .inTable("customers")
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
      table.date("paydate");
      table.string("ticket_url");
      table.string("nfe");
      table.boolean("generated");
      table.integer("status_payment").defaultTo(1);
      table.double("payment_value");
      table.integer("id_bol");
      table.string("id_fat");
      table.string('id_resquest');
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("update_at").defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists("ticket");
  };
  