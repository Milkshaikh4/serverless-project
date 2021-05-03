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
    this.$logo = qs("#home");
    this.$logout = qs("#logout");
    this.$profile = qs("#profile");
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
      case "errorConfirmP":
        alert("Passwords don't match.");
        break;

      case "errorEmail":
        alert("Email is invalid.");
        break;

      case "errorPassword":
        alert("Password is invalid");
        break;

      case "authError":
        alert(params);
        break;

      case "signupLengthError":
        alert("All values must be greater than 2 characters");
        break;

      case "signupEmailError":
        alert("Invalid email.");
        break;

      case "signupSuccess":
        alert("Sucessfully signed up.");
        break;

      case "to-login":
        {
          const content = this.template.getTemplate("login");

          this.$main.innerHTML = content;

          this.bind("verifyLogin", this.eventFunctions["verifyLogin"]);
          this.bind("loginUser", this.eventFunctions["loginUser"]);
          this.bind("to-signup", this.eventFunctions["to-signup"]);
        }
        break;

      case "to-signup":
        this.$main.innerHTML = this.template.getTemplate("signup");
        this.bind("verifySignup", this.eventFunctions["verifySignup"]);
        this.bind("signupUser", this.eventFunctions["signupUser"]);
        this.bind("to-login", this.eventFunctions["to-login"]);
        break;

      case "loading-screen":
        break;

      case "empty-feed":
        this.$main.innerHTML = this.template.getTemplate("emptyState");
        break;

      case "profile":
        {
          const { displayUserObj } = params;
          this.$main.innerHTML = this.template.getTemplate("profile", [
            displayUserObj,
          ]);

          document.location.hash = "#profile";

          this.bind("show-following", this.eventFunctions["show-following"]);
          this.bind(
            "view-edit-profile-model",
            this.eventFunctions["view-edit-profile-model"]
          );
          this.bind(
            "view-add-post-model",
            this.eventFunctions["view-add-post-model"]
          );
          this.bind("edit-profile", this.eventFunctions["edit-profile"]);
          this.bind("add-post", this.eventFunctions["add-post"]);
        }
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

      case "view-edit-profile-model":
        {
          const model = qs("#edit-profile-model");

          this._toggleVisibility(model);
        }
        break;

      case "view-add-post-model":
        {
          const model = qs("#add-post-model");

          this._toggleVisibility(model);
        }
        break;

      case "user-profile":
        {
          const { displayUserObj } = params;

          const userPage = this.template.getTemplate("userPage", [
            displayUserObj,
          ]);

          this.$main.innerHTML = userPage;

          document.location.hash =
            "#userPage?username=" + displayUserObj.username;

          this.bind("show-following", this.eventFunctions["show-following"]);
          this.bind("toggle-follow", this.eventFunctions["toggle-follow"]);
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

      case "remove-comments":
        {
          const { id } = params;

          const commentSection = qs(`#comment-section-${id}`);

          commentSection.innerText = "";
        }
        break;

      case "view-comments":
        {
          const { displayComments, id, page, bind = true } = params;

          const commentSection = qs(`#comment-section-${id}`);

          const comments = this.template.getTemplate(
            "comment",
            displayComments
          );

          const commentContent = this.template.getTemplate("commentContent", [
            { comments, id },
          ]);

          commentSection.innerHTML = commentContent;

          if (bind) {
            this.bind(
              "post-comment-" + page,
              this.eventFunctions["post-comment"],
              { id, page }
            );
          }
        }
        break;

      case "like-post":
        {
          const { id, likesNum } = params;
          const activeLike = qs(`#active-like-post-${id}`);

          this._toggleVisibility(activeLike);

          const displayLiked = qs(`#display-liked-${id}`);
          displayLiked.textContent = "Likes " + likesNum;
        }
        break;

      case "show-following":
        {
          const { usernames, show } = params;
          const display = qs("#display-following");
          const button = qs("#show-following");

          display.innerHTML = show ? "" : "Following " + usernames.join(", ");
          button.innerHTML = show ? "show more..." : "...show less";
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
      case "home":
        $on(this.$logo, "click", function (e) {
          handler();
        });
        break;

      case "verifyLogin":
        {
          const loginForm = qs("#login");
          $on(loginForm, "submit", function (e) {
            handler(e);
          });
        }
        break;

      case "loginUser":
        {
          const loginForm = qs("#login");
          $on(loginForm, "formdata", function (e) {
            handler(e);
          });
        }
        break;

      case "verifySignup":
        {
          const signupForm = qs("#signup");
          $on(signupForm, "submit", function (e) {
            handler(e);
          });
        }
        break;

      case "signupUser":
        {
          const signupForm = qs("#signup");
          $on(signupForm, "formdata", function (e) {
            handler(e);
          });
        }
        break;

      case "to-login":
        {
          const toLogin = qs("#to-login");
          $on(toLogin, "click", function () {
            handler();
          });
        }
        break;

      case "to-signup":
        {
          const toSignup = qs("#to-signup");

          $on(toSignup, "click", function () {
            handler();
          });
        }
        break;

      case "view-edit-profile-model":
        {
          const editProfileButton = qs("#edit-profile");
          const close = qs("#close-model");

          $on(editProfileButton, "click", function () {
            handler();
          });
          $on(close, "click", function () {
            handler();
          });
        }
        break;

      case "edit-profile":
        {
          const form = qs("#edit-profile-form");

          $on(form, "submit", function (e) {
            handler[0](e);
          });

          $on(form, "formdata", function (e) {
            handler[1](e);
          });
        }
        break;

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
          const form = qs("#add-post-form");
          const addPostButton = qs("#add-post");
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

      case "view-comments-profile":
        page = "profile";
      case "view-comments-feed":
        {
          if (!page) page = "feed";

          const elemList = qsa(".show-comment");

          elemList.forEach((elem) => {
            const post = parent(elem, "LI");
            const id = post.dataset.id;

            $on(elem, "click", function () {
              handler(id, page);
            });
          });
        }
        break;

      case "post-comment-profile":
        page = "profile";
      case "post-comment-feed":
        {
          if (!page) page = "feed";

          const { id } = params;

          const _page = params.page;

          const elem = qs(`#post-comment-${id}`);

          $on(elem, "click", function () {
            handler(id, _page);
          });
        }
        break;

      case "like-post-profile":
        page = "profile";
      case "like-post-feed":
        {
          if (!page) page = "feed";

          const elemList = qsa(".like");

          elemList.forEach((elem) => {
            const id = elem.dataset.id;
            $on(elem, "click", function () {
              handler(id, page);
            });
            const activeLike = qs("#active-like-post-" + id);
            $on(activeLike, "click", function () {
              handler(id, page);
            });
          });
        }
        break;

      case "to-user":
        {
          const elemList = qsa(".to-user");

          elemList.forEach((elem) => {
            const username = elem.children[0].innerText;
            $on(elem, "click", function () {
              handler(username);
            });
          });
        }
        break;

      case "show-following":
        {
          const elem = qs("#show-following");
          $on(elem, "click", function () {
            handler();
          });
        }
        break;

      case "toggle-follow":
        {
          const elem = qs("#toggle-follow");
          $on(elem, "click", function () {
            handler();
          });
        }
        break;

      case "logout":
        $on(this.$logout, "click", function () {
          handler();
        });
        break;

      case "profile":
        $on(this.$profile, "click", function () {
          handler();
        });
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
