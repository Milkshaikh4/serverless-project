(function (window) {
  "use strict";

  var to = function (data) {
    return JSON.stringify(data);
  };

  var from = function (data) {
    return JSON.parse(data);
  };

  var initialState = {
    scroll: { p: 0, n: 5, loading: false },
    auth: {
      token: null,
      id: null,
      username: null,
    },
    login: {},
    signup: {},
    feed: {
      posts: null,
    },
    profile: {
      user: null,
      posts: null,
      show: false,
    },
  };

  /**
   * Creates a new Model instance and hooks up the storage.
   *
   * @constructor
   *
   */
  function Model() {
    this.token = null;
    this.userID = null;
    this.userObj = null;

    if (localStorage.getItem("state") !== null) {
      return;
    }

    localStorage.setItem("state", to(initialState));
  }

  Model.prototype.clearStorage = function () {
    localStorage.removeItem("state");
  };

  Model.prototype.getState = function () {
    const state = from(localStorage.getItem("state"));
    if (!state) {
      localStorage.setItem("state", to(initialState));
      return initialState;
    }
    return state;
  };

  Model.prototype.setState = function (mutator = (s) => s) {
    const state = this.getState();
    const newState = { ...mutator(state) };
    localStorage.setItem("state", to(newState));
  };

  // Export to window
  window.app = window.app || {};
  window.app.Model = Model;
  window.clearStorage = Model.prototype.clearStorage;
})(window);
