exports.up = function(knex, Promise) {
    return knex.schema.createTable("pay_aux", table => {
      table.increments("id").primary();
      table.string("cnpjcpf").unsigned()
            .index()
            .references("cnpjcpf")
            .inTable("customers")
            .onDelete('CASCADE')
            .onUpdate('CASCADE');

      table.date("paydate");
      table.string("product");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("update_at").defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists("pay_aux");
  };
  