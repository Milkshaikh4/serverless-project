(function (window) {
  "use strict";

  /**
   * Takes an api ref and view and acts as the controller
   *
   * @constructor
   * @param {object} view The view instance
   */

  function AuthManager() {}

  AuthManager.prototype.login = function (dataObj) {};

  AuthManager.prototype.register = function () {};

  AuthManager.prototype.signout = function () {};

  // Export to window
  window.app = window.app || {};
  window.app.AuthManager = AuthManager;
})(window);
