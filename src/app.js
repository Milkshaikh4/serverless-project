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

  if (document.location.hash === "") {
    spa.controller.goToFeed();
  }

  let r = new RegExp(`^#(\\w+)(\\?[\\w\\=\\.\\&]+)?$`);
  const hash = document.location.hash;

  if (!r.test(hash)) {
    console.log("Invalid Url");
    return;
    // this.view.render("404");
  }

  const matches = r.exec(hash);

  var getStateFromHash = () => {
    const paramString = matches[2].slice(1);

    let kv = paramString.split("&");

    const kvs = kv.map((ks) => {
      return ks.split("=");
    });

    const newState = {};

    kvs.forEach((ks) => {
      newState[ks[0]] = ks[1];
    });

    return newState;
  };

  const route = matches[1];

  if (route === "userPage") {
    let state = null;

    if (matches.length === 3) {
      state = getStateFromHash();
    } else return;

    spa.controller.goToUserPage(state.username);
  } else if (route === "feed") {
    spa.controller.goToFeed();
  } else if (route === "login") {
    spa.controller.goToLogin();
  } else if (route === "signup") {
    spa.controller.goToSignup();
  } else if (route === "profile") {
    spa.controller.goToProfile();
  }

  // infinite scroll
  window.onscroll = (ev) => {
    const url = document.location.hash;

    if (!r.test(url)) {
      return;
    }

    const m = r.exec(url);

    if (m[1] !== "feed") {
      return;
    }
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight) {
      console.log("Infinite Scroll");
      spa.controller.getMorePosts();
    }
  };

  // Debug
  window.state = spa.model.getState;
  window.follow = (username) => spa.controller.follow(username);
  window.getFeed = (p, n) => spa.controller._getUserFeed(p, n);
  window.spa = spa;
})();
