exports.up = function(knex, Promise) {
    return knex.schema.createTable("customers", table => {
      table.increments("id").primary();
      table.text("nameaccount").notNull();
      table.string("cnpjcpf").unique();
      table.text("email").unique();
      table.string("responsavel")
      table.string("password");
      table.string("registerdate");
      table.string("pjpf");
      table.string("logradouro");
      table.string("number");
      table.string("complement");
      table.string("cep");
      table.string("state");
      table.string("city");
      table.string("type");
      table.string("comercial");
      table.string("comercial2");
      table.string("celular");
      table.string("celular2");
      table.text("reset_password_token");
      table.text("reset_password_expires");
      table.text("updated_data");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("update_at").defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists("customers");
  };
  