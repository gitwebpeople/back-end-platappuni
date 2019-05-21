exports.up = function(knex, Promise) {
    return knex.schema.createTable("billing", table => {
      table.increments("id").primary();
      table.string("cnpjcpf").unsigned()
            .index()
            .references("cnpjcpf")
            .inTable("customers")
            .onDelete('CASCADE')
            .onUpdate('CASCADE');

      table.double("baseval");
      table.double("retval");
      table.string("period");
      table.string("product");
      table.string("payday");

      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("update_at").defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists("billing");
  };
  