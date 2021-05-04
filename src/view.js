(function (window) {
  "use strict";

  /**
   * View that abstracts away the browser's DOM a bit.
   */
  function View(template) {
    this.template = template;
    this.eventFunctions = {};

    this.$main = qs("main");
    this.$feed = qs("#feed");
    this.$emptyState = qs("#empty-state");
    this.$createPostModal = qs('form[id="create-post"]')
  }

  View.prototype._toggleVisibility = function (elem) {
    if (elem.classList.contains("active")) {
      elem.classList.remove("active");
      elem.classList.add("inactive");
    } else {
      elem.classList.remove("inactive");
      elem.classList.add("active");
    }
  };

  View.prototype.render = function (cmd, params) {
    switch (cmd) {
      case "empty-feed":
        this.$main.innerHTML = this.template.getTemplate("emptyState");
        break;

      case "user-posts":
        {
          const { displayPosts, isUser = false } = params;
          const userPage = qs("#user-posts");
          const ulWrapper = document.createElement("ul");
          ulWrapper.className = "post-list";
          ulWrapper.innerHTML = this.template.getTemplate(
            "post",
            displayPosts,
            { isUser }
          );
          userPage.appendChild(ulWrapper);

          displayPosts.forEach((post) => {
            if (post.isLiked) {
              this.render("like-post", {
                id: post.id,
                likesNum: post.likesNum,
              });
            }
          });

          this.bind("like-post-profile", this.eventFunctions["like-post"]);
          this.bind(
            "view-comments-profile",
            this.eventFunctions["view-comments"]
          );
          this.bind(
            "view-edit-post-model",
            this.eventFunctions["view-edit-post"]
          );
          this.bind("edit-post", this.eventFunctions["edit-post"]);
        }
        break;

      case "view-edit-post-model":
        {
          const model = qs(".post-options-container .model");

          this._toggleVisibility(model);
        }
        break;

      case "view-add-post-model":
        {
          const model = parent(this.$createPostModal)
          this._toggleVisibility(model);
        }
        break;

      case "feed":
      case "to-feed":
        {
          const { displayPosts } = params;
          const ulWrapper = document.createElement("ul");
          ulWrapper.className = "post-list";
          ulWrapper.innerHTML = this.template.getTemplate("post", displayPosts);
          this.$main.innerHTML = "";
          this.$main.appendChild(ulWrapper);

          this.bind("like-post-feed", this.eventFunctions["like-post"]);
          this.bind("to-user", this.eventFunctions["to-user"]);
          this.bind("view-comments-feed", this.eventFunctions["view-comments"]);

          displayPosts.forEach((post) => {
            if (post.isLiked) {
              this.render("like-post", {
                id: post.id,
                likesNum: post.likesNum,
              });
            }
          });
        }
        break;

      default: {
        alert("Invalid cmd " + cmd);
      }
    }
  };

  View.prototype.bind = function (event, handler, params = {}) {
    let page = "";
    switch (event) {

      case "add-post":
        {
          const form = qs("#add-post-form");

          $on(form, "submit", function (e) {
            handler[0](e);
          });

          $on(form, "formdata", function (e) {
            handler[1](e);
          });
        }
        break;

      case "edit-post":
        {
          const submitList = qsa(".post .model form");

          submitList.forEach((form) => {
            $on(form, "submit", function (e) {
              handler[0](e);
            });
            $on(form, "formdata", function (e) {
              handler[1](e);
            });
          });
        }
        break;

      case "view-add-post-model":
        {
          const form = this.$createPostModal;
          const addPostButton = qs("#view-add-post-model");
          const close = qs("#close-model", form);

          $on(addPostButton, "click", function () {
            handler();
          });
          $on(close, "click", function () {
            handler();
          });
        }
        break;

      case "view-edit-post-model":
        {
          const buttonList = qsa(".post #edit");
          const closeList = qsa(".post #close-model");

          buttonList.forEach((button) => {
            $on(button, "click", function () {
              handler();
            });
          });

          closeList.forEach((close) => {
            $on(close, "click", function () {
              handler();
            });
          });
        }
        break;

      default: {
        alert("Invalid bind event " + event);
      }
    }
  };

  View.prototype.registerEventAction = function (eventName, action) {
    this.eventFunctions[eventName] = action;
  };

  // Export to window
  window.app = window.app || {};
  window.app.View = View;
})(window);
