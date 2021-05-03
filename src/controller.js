(function (window) {
  "use strict";

  /**
   * Takes an api ref and view and acts as the controller
   *
   * @constructor
   * @param {object} view The view instance
   */

  function Controller(view, model) {
    var that = this;
    this.view = view;
    this.api = new app.API("http://127.0.0.1:5000/");
    this.model = model;

    this.view.bind("home", function () {
      that.goToFeed();
    });

    this.view.bind("logout", function () {
      that.logout();
    });

    this.view.bind("profile", function () {
      that.goToProfile();
    });

    // For components that aren't rendered yet

    this.view.registerEventAction("verifyLogin", function (e) {
      that.verifyLogin(e);
    });

    this.view.registerEventAction("loginUser", function (e) {
      that.loginUser(e);
    });

    this.view.registerEventAction("verifySignup", function (e) {
      that.verifySignup(e);
    });

    this.view.registerEventAction("signupUser", function (e) {
      that.signupUser(e);
    });

    this.view.registerEventAction("to-login", function () {
      that.goToLogin("to-login");
    });

    this.view.registerEventAction("to-signup", function () {
      that.goToSignup("to-signup");
    });

    this.view.registerEventAction("like-post", function (id, page) {
      that.likePost(id, page);
    });

    this.view.registerEventAction("view-comments", function (id, page) {
      that.getComments(id, page);
    });

    this.view.registerEventAction("to-user", function (username) {
      that.goToUserPage(username);
    });

    this.view.registerEventAction("show-following", function () {
      that.showFollowing();
    });

    this.view.registerEventAction("toggle-follow", function () {
      that.toggleFollow();
    });

    this.view.registerEventAction("post-comment", function (id, page) {
      that.postComment(id, page);
    });

    this.view.registerEventAction("view-edit-profile-model", function () {
      that.view.render("view-edit-profile-model");
    });

    this.view.registerEventAction("view-add-post-model", function () {
      that.view.render("view-add-post-model");
    });

    this.view.registerEventAction("edit-profile", [
      this.validateEditProfileForm.bind(this),
      this.editProfile.bind(this),
    ]);

    this.view.registerEventAction("add-post", [
      this.validateAddPostForm.bind(this),
      this.addPost.bind(this),
    ]);

    this.view.registerEventAction("view-edit-post", function () {
      that.view.render("view-edit-post-model");
    });

    this.view.registerEventAction("edit-post", [
      this.validateEditPostForm.bind(this),
      this.editPost.bind(this),
    ]);
  }

  /**
   * * * * * * * * * * * *
   *    Auth Services    *
   * * * * * * * * * * * *
   */

  Controller.prototype.auth = function () {
    const state = this.model.getState();

    const token = state?.auth?.token;

    if (!token) {
      this.goToLogin();
      return null;
    }

    return token;
  };

  Controller.prototype.logout = function () {
    this.model.clearStorage();
    this.goToLogin();
  };

  /**
   * * * * * * * * * * * *
   *    Post Services    *
   * * * * * * * * * * * *
   */

  Controller.prototype._findPost = function (id, page) {
    const state = this.model.getState();
    const posts = state[page].posts;
    let post = null;
    let index = 0;

    posts.forEach((_post, i) => {
      if (_post.id == id) {
        post = _post;
        index = i;
        return;
      }
    });

    return [post, index];
  };

  Controller.prototype._postsToInitialState = function (posts) {
    return posts.map((post) => {
      post.showComments = false;
      return post;
    });
  };

  Controller.prototype._toDisplayPostObjList = function (posts) {
    const userID = this.model.getState().auth.id;

    return posts.map((post) => {
      const likes = post.meta.likes;
      const comments = post.comments;
      return {
        id: post.id,
        author: post.meta.author,
        src: post.src,
        likesNum: likes.length,
        commentsNum: comments.length,
        isLiked: likes.includes(userID),
        showComments: post.showComments,
        comments: post.comments,
        displayDate: timestampeToDate(post.meta.published),
        desc: post.meta.description_text,
      };
    });
  };

  Controller.prototype._toDisplayComments = function (comments) {
    return comments.map((comment) => {
      return {
        ...comment,
        published: timestampeToDate(comment.published),
      };
    });
  };

  Controller.prototype.likePost = function (id, page) {
    const token = this.auth();
    if (!token) return;

    const [post, index] = this._findPost(id, page);
    if (!post) return;

    const state = this.model.getState();
    const likes = post.meta.likes;
    const userID = state.auth.id;

    if (likes.includes(userID)) {
      this.api.put("post/unlike", { id }, {}, token).then((_) => {
        this.model.setState((_state) => {
          _state[page].posts[index].meta.likes = likes.filter(
            (u) => u !== userID
          );
          return _state;
        });

        this.view.render("like-post", {
          id,
          likesNum: likes.length - 1,
        });
      });
    } else {
      this.api.put("post/like", { id }, {}, token).then((_) => {
        likes.push(userID);
        this.model.setState((_state) => {
          _state[page].posts[index].meta.likes = likes;
          return _state;
        });

        this.view.render("like-post", {
          id,
          likesNum: likes.length,
        });
      });
    }
  };

  Controller.prototype.createPost = function (payload, token) {
    return this.api.post("post/", payload, token);
  };

  Controller.prototype._editPost = function (id, payload, token) {
    return this.api.put("post/", { id }, payload, token);
  };

  Controller.prototype.postComment = function (id, page) {
    const token = this.auth();
    if (!token) return;

    const [post, index] = this._findPost(id, page);
    if (!post) return null;

    const getComment = () => {
      const input = qs(`#write-comment-${id}`);

      return input.value;
    };

    const comment = getComment();

    this.api.put("post/comment", { id }, { comment }, token).then((_) => {
      const state = this.model.getState();
      let comments = state[page].posts[index].comments;
      comments.push({
        author: state.auth.username,
        published: new Date().getTime(),
        comment,
      });

      this.model.setState((_state) => {
        _state[page].posts[index].comments = comments;
        return _state;
      });

      const displayComments = this._toDisplayComments(comments);

      this.view.render("view-comments", {
        id,
        displayComments,
        page,
        bind: false,
      });
    });
  };

  Controller.prototype.getComments = function (id, page) {
    const token = this.auth();
    if (!token) return;

    const [post, index] = this._findPost(id, page);
    if (!post) return null;

    if (page !== "feed" && page !== "profile") {
      console.log({ msg: "page not found in getComments", id, page });
      return;
    }

    if (post.showComments) {
      this.view.render("remove-comments", { id });
      this.model.setState((state) => {
        state[page].posts[index].showComments = false;
        return state;
      });
      return;
    }

    const displayComments = this._toDisplayComments(post.comments);

    this.model.setState((state) => {
      state[page].posts[index].showComments = true;
      return state;
    });

    this.view.render("view-comments", { displayComments, id, page });
  };

  Controller.prototype.deletePost = function (id) {
    const token = this.auth();
    if (!token) return null;
    return this.api.delete("post/", { id }, token);
  };

  /**
   * * * * * * * * * * * *
   *    User Services    *
   * * * * * * * * * * * *
   */

  Controller.prototype.toggleFollow = function () {
    const token = this.auth();
    if (!token) return;

    const _state = this.model.getState();
    const userFollowing = _state.auth.following;
    const following = _state.profile.user.following;
    const userID = _state.auth.id;
    const username = _state.profile.user.username;
    const id = _state.profile.user.id;

    const isUserFollowing = userFollowing.includes(id);

    if (isUserFollowing) {
      this.api.put("user/unfollow", { username }, {}, token).then((_) => {
        this.model.setState((state) => {
          state.profile.user.following = following.filter((i) => i !== user);
          state.auth.following = userFollowing.filter((i) => i !== id);
          return state;
        });

        document.location.reload();
      });
    } else {
      this.api.put("user/follow", { username }, {}, token).then((_) => {
        this.model.setState((state) => {
          state.profile.user.following.push(userID);
          state.auth.following.push(id);
          return state;
        });

        document.location.reload();
      });
    }
  };

  Controller.prototype._editUser = function (payload, token) {
    return this.api.put("user/", {}, payload, token);
  };

  Controller.prototype._getUserID = function (username, token) {
    this.api.get("user/", { username }, token).then((data) => {
      this.model.setState((state) => {
        state.auth.id = data.id;
        state.auth.following = data.following;
        return state;
      });
    });
  };

  Controller.prototype._getUserFeed = function (p = 0, n = 5) {
    const token = this.auth();
    if (!token) return null;

    this.model.setState((state) => {
      state.scroll.loading = true;
      return state;
    });

    return this.api
      .get("user/feed", { p, n }, token)
      .then((data) => {
        this.model.setState((state) => {
          state.scroll.loading = false;
          state.scroll.p += data.posts.length;
          return state;
        });

        const state = this.model.getState();

        return data;
      })
      .catch((err) => {
        console.warn(err);
        const _state = this.model.getState();

        if (_state.feed.posts !== null) {
          return this._toDisplayPostObjList(_state.feed.posts);
        }

        return [{}];
      });
  };

  /**
   * * * * * * * * * * * *
   *    Handle Forms     *
   * * * * * * * * * * * *
   */

  Controller.prototype._fileToData64 = (element) =>
    new Promise((resolve, reject) => {
      const file = element.files[0];
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  Controller.prototype.verifyLogin = function (e) {
    if (e) {
      e.preventDefault();
    }

    const r = new RegExp(".{2,50}");

    const username = qs("#username");
    const password = qs("#password");
    const confirmP = qs("#password2");

    if (confirmP.value !== password.value) {
      this.view.render("errorConfirmP");
      return;
    } else if (!r.test(username.value)) {
      this.view.render("errorEmail");
      return;
    } else if (!r.test(password.value)) {
      this.view.render("errorPassword");
      return;
    }

    const loginForm = qs("#login");

    new FormData(loginForm);
  };

  Controller.prototype.loginUser = function (e) {
    let dataObj = {};

    for (let kv of e.formData.entries()) {
      dataObj[kv[0]] = kv[1];
    }

    this.api
      .post("auth/login", dataObj, false)
      .then((data) => {
        const { token } = data;

        this.model.setState((state) => {
          state.auth.token = token;
          state.auth.username = dataObj.username;
          return state;
        });
        this._getUserID(dataObj.username, token);
        this.goToFeed();
      })
      .catch((err) => {
        this.view.render("authError", err);
      });
  };

  Controller.prototype.verifySignup = function (e) {
    if (e) {
      e.preventDefault();
    }

    const emailR = new RegExp("^.+@.+..+$");
    const lengthR = new RegExp(".{2,50}");

    const username = qs("#signup-username");
    const passsword = qs("#signup-password");
    const password2 = qs("#signup-password2");
    const email = qs("#email");
    const name = qs("#name");

    const inputs = [username, passsword, password2, email, name];

    let failure = false;

    inputs.forEach((input) => {
      if (!lengthR.test(input.value)) {
        failure = true;
      }
    });

    if (failure) {
      this.view.render("signupLengthError");
    } else if (!emailR.test(email.value)) {
      this.view.render("signupEmailError");
    }

    const signupForm = qs("#signup");

    new FormData(signupForm);
  };

  Controller.prototype.signupUser = function (e) {
    if (e) {
      e.preventDefault();
    }

    let data = {};

    for (let kv of e.formData.entries()) {
      data[kv[0]] = kv[1];
    }

    this.api
      .post("auth/signup", data)
      .then((data) => {
        this.model.setState((state) => {
          state.auth.token = data.token;
          return state;
        });
      })
      .catch((err) => {
        alert("Unable to sign up user.");
      });

    this.goToLogin();
  };

  Controller.prototype.validateEditProfileForm = function (e) {
    if (e) {
      e.preventDefault();
    }

    const lengthR = new RegExp(".{2,50}");
    const emailR = new RegExp("^.+@.+..+$");

    const email = qs("#edit-email");
    const name = qs("#edit-name");
    const password = qs("#edit-password");
    const inputs = [email, password, name];

    let failure = false;

    inputs.forEach((input) => {
      if (input.value !== "" && !lengthR.test(input.value)) {
        failure = true;
      }
    });

    if (failure) {
      this.view.render("signupLengthError"); //TODO
    } else if (email.value !== "" && !emailR.test(email.value)) {
      this.view.render("signupEmailError"); //TODO
    }

    const form = qs("#edit-profile-form");

    new FormData(form);
  };

  Controller.prototype.editProfile = function (e) {
    if (e) {
      e.preventDefault();
    }

    const token = this.auth();
    if (!token) return;

    let data = {};

    for (let kv of e.formData.entries()) {
      if (kv[1] === "") continue;
      data[kv[0]] = kv[1];
    }

    const keys = Object.keys(data);
    if (!keys.length) {
      return;
    }

    this._editUser(data, token).then((res) => {
      this.goToProfile();
    });
  };

  Controller.prototype.validateAddPostForm = function (e) {
    if (e) {
      e.preventDefault();
    }

    const lengthR = new RegExp(".{2,50}");
    const form = qs("#add-post-form");
    const descr = qs("#descr", form);

    if (!lengthR.test(descr.value)) {
      this.view.render("signupLengthError"); //TODO
    }

    new FormData(form);
  };

  Controller.prototype.addPost = function (e) {
    if (e) {
      e.preventDefault();
    }
    const token = this.auth();
    if (!token) return;

    const form = qs("#add-post-form");
    const descr = qs("#descr", form).value;
    const image = qs("#src", form);

    const r = new RegExp("^.*base64,(.*)$");

    this._fileToData64(image).then((src) => {
      const matches = r.exec(src);
      const payload = { description_text: descr, src: matches[1] };
      this.createPost(payload, token).then(() => {
        this.goToProfile();
      });
    });
  };

  Controller.prototype.validateEditPostForm = function (e) {
    if (e) {
      e.preventDefault();
    }

    const form = e.target;
    const lengthR = new RegExp(".{2,50}");
    const descr = qs("#descr", form);

    if (!lengthR.test(descr.value)) {
      this.view.render("signupLengthError"); //TODO
    }

    new FormData(form);
  };

  Controller.prototype.editPost = function (e) {
    if (e) {
      e.preventDefault();
    }

    const token = this.auth();
    if (!token) return;

    const form = e.target;
    const descr = qs("#descr", form).value;
    const image = qs("#src", form);

    const id = parent(form, "LI").dataset.id;

    const r = new RegExp("^.*base64,(.*)$");

    this._fileToData64(image).then((src) => {
      const matches = r.exec(src);
      const payload = { description_text: descr, src: matches[1] };
      this._editPost(id, payload, token).then(() => {
        this.goToProfile();
      });
    });
  };

  // ------

  Controller.prototype.goToFeed = function () {
    document.location.hash = "#feed";

    const token = this.auth();
    if (!token) return null;

    this.model.setState((state) => {
      state.scroll.p = 0;
      return state;
    });

    this._getUserFeed().then((data) => {
      if (data.posts.length === 0) {
        this.view.render("empty-feed");
        return;
      }

      this.model.setState((state) => {
        state.feed.posts = this._postsToInitialState(data.posts);
        return state;
      });

      const displayPosts = this._toDisplayPostObjList(data.posts);

      if (!displayPosts) return;
      this.view.render("to-feed", { displayPosts });
    });
  };

  Controller.prototype.goToLogin = function () {
    this.view.render("to-login");
  };

  Controller.prototype.goToSignup = function () {
    this.view.render("to-signup");
  };

  Controller.prototype._getUser = function (username, toDisplayUserObj) {
    const token = this.auth();
    const _state = this.model.getState();

    return this.api
      .get("user/", { username }, token)
      .then((data) => {
        this.model.setState((state) => {
          state.profile.user = { ...data };
          return state;
        });

        return toDisplayUserObj(data);
      })
      .catch((err) => {
        if (_state.profile.user?.username === username) {
          return { ..._state.profile.user };
        }
      });
  };

  Controller.prototype._getUserPosts = function () {
    const token = this.auth();
    if (!token) return;

    const state = this.model.getState();
    const posts = state.profile.user.posts;

    return Promise.all(posts.map((id) => this.api.get("post", { id }, token)))
      .then((data) => {
        this.model.setState((_state) => {
          _state.profile.posts = data;
          return _state;
        });

        return this._toDisplayPostObjList(data);
      })
      .catch((_) => {
        if (state.profile.posts !== null) {
          return this._toDisplayPostObjList(state.profile.posts);
        }
      });
  };

  Controller.prototype._getRandomImage = function () {
    // Select avatar from list of random avatars

    let r = Math.random();
    r *= 10;
    r = Math.floor(r);
    r /= 2;
    r = (Math.floor(r) + 1) % 10;

    const base = "./assets/avatars/avatars-material-";

    if (r < 5) {
      return base + "man-" + r + ".png";
    } else {
      return base + "woman-" + r + ".png";
    }
  };

  Controller.prototype.goToUserPage = function (username) {
    const token = this.auth();
    if (!token) return;

    const state = this.model.getState();
    const following = state.auth.following;

    const toDisplayUserObj = (userObj) => {
      const id = userObj.id;
      return {
        id: id,
        username: userObj.username,
        numPosts: userObj.posts.length,
        numFollowers: userObj.followed_num,
        numFollowing: userObj.following.length,
        followActionText: following.includes(id) ? "Unfollow" : "Follow",
        fullname: userObj.name,
        avatarSrc: this._getRandomImage(),
      };
    };

    this._getUser(username, toDisplayUserObj).then((displayUserObj) => {
      this.view.render("user-profile", { displayUserObj });

      this.model.setState((state) => {
        state.profile.show = false;
        return state;
      });

      this._getUserPosts().then((displayPosts) => {
        this.view.render("user-posts", { displayPosts });
      });
    });
  };

  Controller.prototype.goToProfile = function () {
    if (!this.auth()) return;
    const state = this.model.getState();
    const username = state.auth.username;

    const toDisplayUserObj = (userObj) => {
      return {
        id: userObj.id,
        username: userObj.username,
        email: userObj.email,
        numPosts: userObj.posts.length,
        numFollowers: userObj.followed_num,
        numFollowing: userObj.following.length,
        fullname: userObj.name,
        avatarSrc: this._getRandomImage(),
      };
    };

    this._getUser(username, toDisplayUserObj).then((displayUserObj) => {
      this.view.render("profile", { displayUserObj });

      this.model.setState((state) => {
        state.profile.show = false;
        return state;
      });

      this._getUserPosts().then((displayPosts) => {
        this.view.render("user-posts", { displayPosts, isUser: true });
      });
    });
  };

  Controller.prototype.showFollowing = function () {
    const state = this.model.getState();
    const token = state.auth.token;
    const userObj = state.profile.user;

    Promise.all(
      userObj.following.map((id) => this.api.get("user", { id }, token))
    )
      .then((data) => {
        const usernames = data.map((i) => i.username);
        this.model.setState((state) => {
          state.profile.following = [...usernames];
          return state;
        });

        const show = state.profile.show;
        this.model.setState((state) => {
          state.profile.show = !show;
          return state;
        });

        this.view.render("show-following", { usernames, show });
      })
      .catch(() => {
        if (state.profile.following !== null) {
          usernames = [...state.profile.following];
        }
      });
  };

  Controller.prototype.getMorePosts = function () {
    const token = this.auth();
    if (!token) return;

    const state = this.model.getState();
    let posts = state.feed.posts.length ? [...state.feed.posts] : [];

    const { p, n, loading } = state.scroll;

    if (loading) return;

    this._getUserFeed(p, n).then((data) => {
      const newPosts = this._postsToInitialState(data.posts);
      posts = posts.concat(newPosts);

      this.model.setState((_state) => {
        _state.feed.posts = [...posts];
        return _state;
      });

      const displayPosts = this._toDisplayPostObjList(posts);

      if (!displayPosts) return;
      this.view.render("to-feed", { displayPosts });
    });
  };

  // Export to window
  window.app = window.app || {};
  window.app.Controller = Controller;
})(window);
