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

    this.view.bind("view-add-post-model", () =>
      that.view.render("view-add-post-model")
    );

    this.view.bind("submit-create-post", (e) => that.handleSubmitCreatePost(e));
  }

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

  Controller.prototype.createPost = function (payload) {
    // TODO - hook up to lamda
    console.log("Create post not implemented");
  };

  Controller.prototype._editPost = function (id, payload, token) {
    return this.api.put("post/", { id }, payload, token);
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

  Controller.prototype.handleSubmitCreatePost = (e) => {
    if (e) e.preventDefault();

    const form = qs('form[id="create-post"]');
    const descr = qs("#descr", form).value;
    const image = qs("#src", form);

    const r = new RegExp("^.*base64,(.*)$");

    this._fileToData64(image).then((src) => {
      const matches = r.exec(src);
      const payload = { description_text: descr, src: matches[1] };
      this.createPost(payload);
    });
  };

  Controller.prototype.validateEditPostForm = function (e) {
    if (e) e.preventDefault();

    const form = e.target;
    const lengthR = new RegExp(".{2,50}");
    const descr = qs("#descr", form);

    if (!lengthR.test(descr.value)) {
      this.view.render("signupLengthError"); //TODO
    }

    new FormData(form);
  };

  Controller.prototype.editPost = function (e) {
    if (e) e.preventDefault();

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
