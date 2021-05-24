(function (window) {
  const editModelTemplate = `
  <form>
    <div class="title">
      <div></div> 
      <h2>Edit post</h2>
      <img id="close-model" class="close-icon" src="./assets/close.svg" alt="close icon" />
    </div>


    <div class="form-row">
      <label for="descr">Description:</label>
      <input
        id="descr"
        name="descr"
        type="text"
        value="This is a cute photo :)"
        placeholder="This is a cute photo :)"
        required
      />
    </div>

    <div class="form-row">
      <input
        id="src"
        name="src"
        type="file"
        accept="image/png"
        required
      />
    </div>

    <button type="submit" class="primary">Edit post</button>
  </form>
  `;

  const optionsTemplate = `
  <div class="post-options-container">
    <button class="post-options"></button>
    <div class="dropdown">
      <div class="dropdown-item" id="edit">Edit</div>
      <div class="dropdown-item" id="delete">Delete</div>
    </div>
    <div class="model inactive" id="edit-model">
      ${editModelTemplate}
    </div>
  </div>
  `;

  const postTemplate = `
  <li data-id="{{id}}" class="post-container" id="post">
    <div class="post">
      <div class="header">
        <div>
          <h4>Nabil Shaikh</h4>
          <small>{{displayDate}}</small>
        </div>
        <div id="popover-container">
          <button class="options-popover" id="options" aria-describedby="tooltip"></button>
          <div id="tooltip" role="tooltip">
            <div class="tooltip-item" id="delete-action">
              <img class="delete-icon" src="./assets/delete.svg"></img>
              <span>Delete</span>
            </div>
          </div>
        </div>
      </div>
      <img src="{{src}}" alt="Image post" id="post-image"/>
      <div class="desc">
        <p class="desc-text">{{descr}}</p>
        <div class='flex'>
          <button class="like" data-id="{{id}}"></button>
          <div class="active-like inactive" data-id="{{id}}" id="active-like-post-{{id}}"></div>
          <button class="show-comment"></button> 
        </div>
      </div>
    </div>
  </li>
  `;

  const editUserModelTemplate = `
  <form id="edit-profile-form">
    <div class="title">
      <div></div> 
      <h2>Edit User Information</h2>
      <img id="close-model" class="close-icon" src="./assets/close.svg" alt="close icon" />
    </div>

    <div class="form-row">
      <label for="edit-name">Name:</label>
      <input
        id="edit-name"
        name="name"
        type="text"
        placeholder="{{fullname}}"
      />
    </div>

    <div class="form-row">
      <label for="edit-email">Email:</label>
      <input
        id="edit-email"
        name="email"
        type="text"
        placeholder="{{email}}"
      />
    </div>

    <div class="form-row">
      <label for="edit-password">Password:</label>
      <input
        id="edit-password"
        name="password"
        type="password"
        placeholder="*****"
      />
    </div>

    <button type="submit" class="primary">Done</button>
</form>
  `;

  const addPostModelTemplate = `
  <form id="add-post-form">
    <div class="title">
      <div></div> 
      <h2>Add post</h2>
      <img id="close-model" class="close-icon" src="./assets/close.svg" alt="close icon" />
    </div>


    <div class="form-row">
      <label for="descr">Description:</label>
      <input
        id="descr"
        name="descr"
        type="text"
        value="This is a cute photo :)"
        placeholder="This is a cute photo :)"
        required
      />
    </div>

    <div class="form-row">
      <input
        id="src"
        name="src"
        type="file"
        accept="image/png, image/jpeg"
        required
      />
    </div>

    <button type="submit" class="primary">Create post</button>
  </form>
  `;

  const profileTemplate = `
  <div class="profile content" data-id="{{id}}">
  <div class="user-header">
    <div class="avatar">
      <img src="{{avatarSrc}}" alt="User avatar"/>
      <h4>@{{username}}</h4>
    </div>
    <div class="user-header-details">
      <div>
        <h1>{{fullname}}</h1>
        <button class="secondary" id="edit-profile">Edit</button>
        <div class="model inactive" id="edit-profile-model">
          ${editUserModelTemplate}
        </div>
      </div>
      <div class="user-details">
        <div>
          <span>{{numPosts}}</span>
          <h4>posts</h4>
        </div>
        <div>
          <span>{{numFollowers}}</span>
          <h4>followers</h4>
        </div>
        <div>
          <span>{{numFollowing}}</span>
          <h4>following</h4>
        </div>
      </div>
      <div>
        <p id="display-following"></p><button id="show-following">show following...</button>
      </div>

    </div>
  </div>

  <div class="divider"></div>
  <div class="add-post">
    <button class="primary" id="add-post">Add post</button>
    <div class="model inactive" id="add-post-model">
      ${addPostModelTemplate}
    </div>
  </div>
  <div id="user-posts"></div>
</div>
  `;

  const userPageTemplate = `
  <div class="profile content" data-id="{{id}}">
  <div class="user-header">
    <div class="avatar">
      <img src="{{avatarSrc}}" alt="User avatar"/>
      <h4>@{{username}}</h4>
    </div>
    <div class="user-header-details">
      <div>
        <h1>{{fullname}}</h1>
        <button class="primary" id="toggle-follow">{{followActionText}}</button>
      </div>
      <div class="user-details">
        <div>
          <span>{{numPosts}}</span>
          <h4>posts</h4>
        </div>
        <div>
          <span>{{numFollowers}}</span>
          <h4>followers</h4>
        </div>
        <div>
          <span>{{numFollowing}}</span>
          <h4>following</h4>
        </div>
      </div>
      <div>
        <p id="display-following"></p><button id="show-following">show following...</button>
      </div>

    </div>
  </div>

  <div class="divider"></div>
  <div id="user-posts"></div>
</div>
  `;

  const emptyStateTemplate = `
    <div id="empty-state" class="content">
      <img
        alt="Empty feed state"
        src="https://cdn.dribbble.com/users/130631/screenshots/14315652/media/a95a2f106f81ae9bb46990c21e021826.png?compress=1&resize=400x300"
      />
      <h3>Your user feed is empty</h3>
      <p>Please follow somone or come back later for updates :)</p>
    </div>
  `;

  const signupFormTemplate = `
  <div class="signup content">
    <form id="signup">
    <h2>Register an account</h2>

    <div class="form-row">
      <label for="signup-username">Username:</label>
      <input
        id="signup-username"
        name="username"
        type="text"
        value="n.shaikh"
        placeholder="xX_greginator_Xx"
        required
      />
    </div>

    <div class="form-row">
      <label for="signup-password">Password:</label>
      <input
        id="signup-password"
        name="password"
        value="password"
        type="password"
        placeholder="*****"
        required
      />
    </div>

    <div class="form-row">
      <label for="signup-password2">Confirm password:</label>
      <input
        id="signup-password2"
        value="password"
        type="password"
        placeholder="*****"
        required
      />
    </div>

    <div class="form-row">
      <label for="email">Email:</label>
      <input
        id="email"
        name="email"
        type="text"
        value="nabil.shaikh.nabil@gmail.com"
        placeholder="John.smith@example.com"
        required
      />
    </div>

    <div class="form-row">
      <label for="name">Name:</label>
      <input
        id="name"
        name="name"
        type="text"
        value="Nabil Shaikh"
        placeholder="John Smith"
        required
      />
    </div>

    <div class="button-G">
      <button type="submit" class="primary">Register</button>
      <button id="to-login" type="button" class="secondary">
        Already have an account?
      </button>
    </div>
  </form>
  </div>
  `;

  const loginFormTemplate = `
  <div class="login content">
    <form id="login">
    <h2>Login</h2>
    <div class="form-row">
      <label for="username">Username:</label>
      <input
        name="username"
        id="username"
        type="text"
        value="n.shaikh"
        placeholder="xX_greginator_Xx"
        required
      />
    </div>

    <div class="form-row">
      <label for="password">Password:</label>
      <input
        name="password"
        id="password"
        value="password"
        type="password"
        placeholder="********"
        required
      />
    </div>

    <div class="form-row">
      <label for="password2">Confirm password:</label>
      <input
        id="password2"
        value="password"
        type="password"
        placeholder="********"
        required
      />
    </div>
    <div class="button-G">
      <button type="submit" class="primary">Login</button>
      <button id="to-signup" type="button" class="secondary">
        Create an account
      </button>
    </div>
  </form>
</div>
  `;

  const commentContentTemplate = `
    <div class="comment-content-container">
      <div class="comment-content" id="comment-content-{{id}}">
        {{comments}}
      </div>
      <div class="form-row comment-input">
        <input type="text" id="write-comment-{{id}}" class="write-comment" placeholder="Leave a comment."></input>
        <img id="post-comment-{{id}}" class="post-icon" src="./assets/send.svg" alt="post comment icon" />
      </div>
    </div>
  `;

  const commentTemplate = `
    <div class="comment-container">
      <div class="comment">
        <h3>{{author}}</h3>
        <p>{{comment}}</p>
      </div>
      <small>{{published}}</small>
    </div>
  `;

  const commentContent = {
    getTemplate: () => commentContentTemplate,
    items: ['comments', 'id'],
  };

  const comment = {
    getTemplate: () => commentTemplate,
    items: ['author', 'comment', 'published'],
  };

  const post = {
    getTemplate: () => postTemplate,
    items: [
      'id',
      'src',
      'descr',
      'displayDate',
    ],
  };

  const userPage = {
    getTemplate: () => userPageTemplate,
    items: [
      'id',
      'username',
      'numPosts',
      'numFollowers',
      'numFollowing',
      'followActionText',
      'fullname',
      'avatarSrc',
    ],
  };

  const profile = {
    getTemplate: () => profileTemplate,
    items: [
      'id',
      'username',
      'numPosts',
      'numFollowers',
      'numFollowing',
      'fullname',
      'avatarSrc',
      'email',
    ],
  };
  /**
   * Set ups all templates
   *
   * @constructor
   */
  function Template() {
    this.templates = {
      post,
      commentContent,
      comment,
      userPage,
      profile,
    };
  }

  /**
   * Creates an <li> HTML string and returns it for placement in your app.
   *
   * @param {string} template Name of the template to be rendered
   * @param {array<object>} data List of objects containing keys you want to find in the
   *                      template to replace.
   * @returns {string} HTML String containing the html of the template
   */
  Template.prototype.getTemplate = function (name, data = [{}], options = {}) {
    if (!data) return '';
    if (!Array.isArray(data)) return '';

    let view = '';
    const params = this.templates[name].items;

    if (!params.length) return this.templates[name].getTemplate(options);

    for (let i = 0; i < data.length; i++) {
      let template = this.templates[name].getTemplate(options);

      params.forEach((param) => {
        const keys = Object.keys(data[i]);
        if (!keys.includes(param)) {
          return;
        }

        template = template.replaceAll(`{{${param}}}`, data[i][param]);
      });

      view += template;
    }

    return view;
  };

  window.app = window.app || {};
  window.app.Template = Template;
}(window));
