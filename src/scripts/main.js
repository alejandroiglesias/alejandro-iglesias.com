/*eslint no-unused-vars: 1*/
(function() {
  'use strict';

  /**
   * Anti-spam function to append link with email address into DOM.
   *
   * @param user    Username part of the email address.
   * @param domain  Domain part of the email address.
   */
  window.email = function(user, domain) {
    document.write('<a href="mailto:' + user + '@' + domain + '">' + user + '@' + domain + '</a>');
  };

}());
