/* eslint-disable no-undef */
(function (window) {
  /**
   * View that abstracts away the browser's DOM a bit.
   */
  function View(template) {
    this.template = template;
    this.eventFunctions = {};
    this.$main = qs('main');
    this.$feed = qs('#feed');
    this.$emptyState = qs('#empty-state');
    this.$createPostForm = qs('form[id="create-post"]');
  }

  View.prototype._toggleVisibility = function (elem) {
    if (elem.classList.contains('active')) {
      elem.classList.remove('active');
      elem.classList.add('inactive');
    } else {
      elem.classList.remove('inactive');
      elem.classList.add('active');
    }
  };

  View.prototype.render = function (cmd, params) {
    switch (cmd) {
      case 'empty-feed':
        this.$main.innerHTML = this.template.getTemplate('emptyState');
        break;

      case 'view-edit-post-model':
        {
          const model = qs('.post-options-container .model');

          this._toggleVisibility(model);
        }
        break;

      case 'view-add-post-model':
        {
          const model = parent(this.$createPostForm);
          this._toggleVisibility(model);
        }
        break;

      case 'feed':
      case 'to-feed':
        {
          const { displayPosts } = params;
          const ulWrapper = document.createElement('ul');
          ulWrapper.className = 'post-list';
          ulWrapper.innerHTML = this.template.getTemplate('post', displayPosts);
          const container = qs('#posts-container');
          container.appendChild(ulWrapper);
        }
        break;

      default: {
        alert(`Invalid cmd ${cmd}`);
      }
    }
  };

  View.prototype.bind = function (event, handler, params = {}) {
    const page = '';
    switch (event) {
      case 'add-post':
        {
          const form = qs('#add-post-form');

          $on(form, 'submit', (e) => {
            handler[0](e);
          });

          $on(form, 'formdata', (e) => {
            handler[1](e);
          });
        }
        break;

      case 'edit-post':
        {
          const submitList = qsa('.post .model form');

          submitList.forEach((form) => {
            $on(form, 'submit', (e) => {
              handler[0](e);
            });
            $on(form, 'formdata', (e) => {
              handler[1](e);
            });
          });
        }
        break;

      case 'view-add-post-model':
        {
          const form = this.$createPostForm;
          const addPostButton = qs('#view-add-post-model');
          const close = qs('#close-model', form);

          $on(addPostButton, 'click', () => {
            handler();
          });
          $on(close, 'click', () => {
            handler();
          });
        }
        break;

      case 'view-edit-post-model':
        {
          const buttonList = qsa('.post #edit');
          const closeList = qsa('.post #close-model');

          buttonList.forEach((button) => {
            $on(button, 'click', () => {
              handler();
            });
          });

          closeList.forEach((close) => {
            $on(close, 'click', () => {
              handler();
            });
          });
        }
        break;

      case 'submit-create-post':

        $on(this.$createPostForm, 'submit', (e) => {
          handler(e);
        });

        break;

      default: {
        alert(`Invalid bind event ${event}`);
      }
    }
  };

  View.prototype.registerEventAction = function (eventName, action) {
    this.eventFunctions[eventName] = action;
  };

  // Export to window
  // eslint-disable-next-line no-param-reassign
  window.app = window.app || {};
  // eslint-disable-next-line no-param-reassign
  window.app.View = View;
}(window));
