module.exports = app => {
  // CUSTOMERS
  app.route('/login').post(app.components.customers.auth.login) // recording activity
  app
    .route('/forgotPassword')
    .post(app.components.customers.auth.forgotPassword) // recording activity
  app.route('/resetPassword').post(app.components.customers.auth.resetPassword) // recording activity
  app
    .route('/registerCustomer')
    .post(app.components.customers.register.registerCustomer)
  app
    .route('/fetchCustomerData')
    .all(app.config.passport.authenticate())
    .get(app.components.customers.customerData.selectCustomerData)
  app
    .route('/updateCustomerData')
    .all(app.config.passport.authenticate())
    .post(app.components.customers.customerData.updateCustomerData) // recording activity
  app
    .route('/alreadyUpdatedData')
    .all(app.config.passport.authenticate())
    .get(app.components.customers.customerData.alreadyUpdatedData)

  // CONTACTS
  app
    .route('/registerNewContact')
    .all(app.config.passport.authenticate())
    .post(app.components.contacts.registerNewContact) // recording activity
  app
    .route('/updateContact')
    .all(app.config.passport.authenticate())
    .post(app.components.contacts.updateContact) // recording activity
  app
    .route('/fetchContacts')
    .all(app.config.passport.authenticate())
    .get(app.components.contacts.fetchContacts)
  app
    .route('/fetchContactsByType')
    .all(app.config.passport.authenticate())
    .get(app.components.contacts.fetchContactsByType)

  // TICKET'S
  app
    .route('/fetchCustomerTickets')
    .all(app.config.passport.authenticate())
    .get(app.components.ticket.index.getCustomerTickets)
  app
    .route('/fetchProductTickets')
    .all(app.config.passport.authenticate())
    .get(app.components.ticket.index.getProductTickets)
  app
    .route('/payTicket')
    .all(app.config.passport.authenticate())
    .get(app.components.ticket.index.payTicket)

  // CONFIG
  app
    .route('/setGlobalConf')
    .all(app.config.passport.authenticate())
    .post(app.cron.scan.api_livre.setGlobalConf) // recording activity
  app
    .route('/getGlobalConf')
    .all(app.config.passport.authenticate())
    .get(app.cron.scan.api_livre.getGlobalConf)

  // BILLING
  app
    .route('/getCustomerProducts')
    .all(app.config.passport.authenticate())
    .get(app.components.billing.getCustomerProducts)

  // RECORD ROUTES
  app
    .route('/getHistoryActivities')
    .all(app.config.passport.authenticate())
    .get(app.components.billing.getHistoryActivities)
}
