(function () {
  "use strict";

  /**
   * Sets up a brand new SPA.
   */
  function SPA() {
    this.template = new app.Template();
    this.view = new app.View(this.template);
    this.model = new app.Model();
    this.controller = new app.Controller(this.view, this.model);
  }

  var spa = new SPA();

  // Debug
  window.state = spa.model.getState;
  window.spa = spa;
})();
