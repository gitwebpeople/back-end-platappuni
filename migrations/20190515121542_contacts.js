exports.up = function(knex, Promise) {
    return knex.schema.createTable("contacts", table => {
      table.increments("id").primary();
      table.bigInteger("id_cliente").notNull();
      table.string("cnpjcpf").unsigned()
            .index()
            .references("cnpjcpf")
            .inTable("customers")
            .onDelete('CASCADE')
            .onUpdate('CASCADE');

      table.string("contact");
      table.string("type");
      table.string("telefone");
      table.string("nome");

      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("update_at").defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists("contacts");
  };
  