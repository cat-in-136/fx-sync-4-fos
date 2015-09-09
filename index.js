window.addEventListener("DOMContentLoaded", function() {
  var P = require("p-promise");
  var Sync = require("fx-sync")();
  var sync;
  var bookmarks;
  var passwords;

  function setCurrentSection(panelName) {
    var panel = document.querySelector(panelName);
    var current = document.querySelector('section.current[role="region"]');
    if (panel.classList.contains("previous")) {
      current.classList.remove("current");
      panel.classList.remove("previous");
      panel.classList.add("current");
    } else {
      current.classList.remove("current");
      current.classList.add("previous");
      panel.classList.add("current");
    }
  }
  function setBookmarks(aBookmarks) {
    bookmarks = aBookmarks;
    if (bookmarks.length === 0) { return; }
    console.debug(bookmarks); // TODO to be removed

    setBookmarksPath(undefined);
  }
  function setBookmarksPath(aPath) {
    if (aPath) { aPath = "places"; }
    var list = document.querySelector("#bookmarks article ul");
    list.innerHTML = "";

    var currentBookmark = bookmarks.find(function(v){return v.id === aPath;});
    if (currentBookmark && currentBookmark.parentid) {
      var parentBookmark = bookmarks.find(function(v){return v.id === currentBookmark.parentid;});
      if ((!parentBookmark) && (currentBookmark.parentid === "places")) {
        parentBookmark = { id: "places" };
      }
      if (parentBookmark) {
        var parentBookmarkItem = document.createElement("li");
        parentBookmarkItem.setAttribute("data-bookmark-type", "folder");
        parentBookmarkItem.innerHTML = '<aside><span class="gaia-icon icon-browser-back" data-type="img"></span></aside><p></p>';
        parentBookmarkItem.querySelector("p").appendChild(
          document.createTextNode(parentBookmark.title || ("("+parentBookmark.id+")"))
        );
        parentBookmarkItem.setAttribute("data-index-num", bookmarks.indexOf(parentBookmark));
        list.appendChild(parentBookmarkItem);
      }
    }
    if (currentBookmark) {
      var currentBookmarkItem = document.createElement("li");
      var header = document.createElement("header");

      currentBookmarkItem.appendChild(header);
      header.appendChild(document.createTextNode(currentBookmark.title || ("("+currentBookmark.id+")")));
    }
    bookmarks.forEach(function (bookmark, index) {
      if (bookmark.parentid === aPath) {
        var item;
        if ((bookmark.type === "bookmark") || (bookmark.type === "microsummary")) {
          item = document.createElement("li");
          item.innerHTML = '<a href="" target="_blank"><p></p><p></p></a>';
          item.querySelector('a:link').href = bookmark.bmkUri;
          item.querySelector('p:first-child').appendChild(document.createTextNode(bookmark.title));
          item.querySelector('p:last-child').appendChild(document.createTextNode(bookmark.bmkUri));

          item.classList.add("bookmark-item");
          item.setAttribute("data-index-num", index);
        } else if (bookmark.type === "folder") {
          item = document.createElement("li");
          item.innerHTML = '<p></p>';
          item.setAttribute("data-bookmark-type", "folder");
          item.getElementsByTagName("p")[0].appendChild(
            document.createTextNode(bookmark.title || ("("+bookmark.id+")"))
          );
          item.classList.add("bookmark-item");
          item.setAttribute("data-index-num", index);
        } else if (bookmark.type === "separator") {
          item = document.createElement("li");
          item.setAttribute("data-bookmark-type", "separator");
          item.innerHTML = "<p></p>";
          item.classList.add("bookmark-item");
          item.setAttribute("data-index-num", index);
        }
        // not supported: query, livemark
        if (item) {
          list.appendChild(item);
        }
      }
    });
    if (list.querySelectorAll("li.bookmark-item").length === 0) {
      var noItem = document.createElement("li");
      noItem.setAttribute("aria-disabled", "true");
      noItem.innerHTML = "<p>(No Item)</p>";
      list.appendChild(noItem);
    }
  }
  function setPasswords(aPasswords) {
    var list = document.querySelector("#passwords article ul");
    list.innerHTML = "";
    passwords = aPasswords;
    console.debug(passwords); // TODO to be removed

    passwords.forEach(function (password, index) {
      if (!password.deleted) {
        var item = document.createElement("li");
        item.innerHTML = '<p></p><p></p>';
        item.querySelector('p:first-child').appendChild(
          document.createTextNode(password.hostname)
        );
        item.querySelector('p:last-child').appendChild(
          document.createTextNode(password.username)
        );
        item.setAttribute("data-index-num", index);
        list.appendChild(item);
      }
    });
    if (list.querySelectorAll("li").length === 0) {
      var noItem = document.createElement("li");
      noItem.setAttribute("aria-disabled", "true");
      noItem.innerHTML = "<p>(No Item)</p>";
      list.appendChild(noItem);
    }
  }

  document.querySelector("*[data-type=sidebar] menu[type=toolbar] a").addEventListener("click", function () {
    document.querySelector("#content").classList.remove("sidebar-opened");
  }, false);
  document.querySelector("#reload-menuitem").addEventListener("click", function () {
    document.querySelector("#content").classList.remove("sidebar-opened");
    setCurrentSection("#index");

    function failSignin(error) {
      console.error(error);// DEBUG
      var errmsg = (typeof(error) === "string")? error : (error.message || error.error);
      utils.status.show("ERROR: " + errmsg);

      var signinForm = document.querySelector("#signin-form");
      Array.forEach(signinForm.querySelectorAll("input, button"), function(v) { v.disabled = false; });
      document.querySelector("#signin-progress").classList.add("hidden");
    }

    try {
      sync.fetch("bookmarks").then(function (results) {
        setBookmarks(results);

        return sync.fetch("passwords");
      }).then(function (results) {
        setPasswords(results);

        return new P();
      }).done(function () {
        utils.status.show("Reloaded");
        setCurrentSection("#storage-menu");
      }, function (error) {
        failSignin(error);
        signinForm.querySelector('input[name="password"]').focus();
      });
    } catch (ex) {
      failSignin(ex);
    }
  }, false);
  document.querySelector("#sign-out-menuitem").addEventListener("click", function () {
    document.querySelector("#content").classList.remove("sidebar-opened");
    setCurrentSection("#index");
    setBookmarks([]);
    setPasswords([]);
    Array.forEach(document.querySelectorAll("#signin-form input, #signin-form button"), function (v) {
      v.disabled = false;
    });
    document.querySelector("#signin-progress").classList.add("hidden");
  }, false);
  document.querySelector("a.sidebar-toggle").addEventListener("click", function () {
    document.querySelector("#content").classList.toggle("sidebar-opened");
  }, false);
  Array.forEach(document.querySelectorAll(".pack-checkbox-box .pack-checkbox ~ span, .pack-radio-box .pack-radio ~ span, .pack-switch-box .pack-switch ~ span"), function(v) {
    v.addEventListener("click", function () {
      v.checked = !v.checked;
      v.dispatchEvent(new Event("change"));
    }, false);
  });

  Array.forEach(document.querySelectorAll("#signin-form *[disabled]"), function(v) { v.disabled = false; });
  document.querySelector("#signin-form").addEventListener("submit", function (event) {
    var signinForm = document.querySelector("#signin-form");
    Array.forEach(signinForm.querySelectorAll("input, button"), function(v) { v.disabled = true; });
    document.querySelector("#signin-progress").classList.remove("hidden");
    event.preventDefault();

    function failSignin(error) {
      console.error(error);// DEBUG
      var errmsg = (typeof(error) === "string")? error : (error.message || error.error);
      utils.status.show("ERROR: " + errmsg);

      Array.forEach(signinForm.querySelectorAll("input, button"), function(v) { v.disabled = false; });
      document.querySelector("#signin-progress").classList.add("hidden");
    }

    var email = signinForm.querySelector('input[name="email"]').value;
    var password = signinForm.querySelector('input[name="password"]').value;
    var ownCloud = signinForm.querySelector('input[name="own-cloud"]').checked;
    var fxaServerUrl = (ownCloud)? signinForm.querySelector('input[name="fxaServerUrl"]').value : undefined;
    var syncAuthUrl = (ownCloud)? signinForm.querySelector('input[name="syncAuthUrl"]').value : undefined;
    var savePassword = signinForm.querySelector('input[name="save-password"]').checked;

    try {
      sync = new Sync({ email: email, password: password }, { fxaServerUrl: fxaServerUrl, syncAuthUrl: syncAuthUrl });
      sync.fetch("bookmarks").then(function (results) {
        setBookmarks(results);

        return sync.fetch("passwords");
      }).then(function (results) {
        setPasswords(results);

        return new P();
      }).then(function (results) {
        if (savePassword) {
          window.localStorage.setItem("email", email);
          window.localStorage.setItem("password", password);
        } else {
          window.localStorage.removeItem("email");
          window.localStorage.removeItem("password");
        }

        return new P();
      }).done(function () {
        utils.status.show("Signed in");
        setCurrentSection("#storage-menu");
      }, function (error) {
        failSignin(error);
        signinForm.querySelector('input[name="password"]').focus();
      });
    } catch (ex) {
      failSignin(ex);
    }
  }, false);
  document.querySelector('#signin-form input[name="own-cloud"]').addEventListener('change', function (event) {
    if (event.currentTarget.checked) {
      document.querySelector("#signin-own-cloud-box").classList.remove("collapse");
    } else {
      document.querySelector("#signin-own-cloud-box").classList.add("collapse");
    }
  }, false);
  document.querySelector('#signin-form input[name="own-cloud"]').dispatchEvent(new Event("change"));
  if (window.localStorage.getItem("email") && window.localStorage.getItem("password")) {
    document.querySelector('#signin-form input[name="email"]').value = window.localStorage.getItem("email");
    document.querySelector('#signin-form input[name="password"]').value = window.localStorage.getItem("password");
    document.querySelector('#signin-form input[name="save-password"]').checked = true;
  }

  Array.forEach(document.querySelectorAll("a.btn-back[data-panel], #storage-menu ul a[data-panel]"), function (v){
    v.addEventListener("click", function (event) {
      var target = event.currentTarget.getAttribute("data-panel");
      setCurrentSection(target);
      event.preventDefault();
    }, false);
  });

  document.querySelector("#bookmarks ul").addEventListener("click", function (event) {
    var targets = this.querySelectorAll('li[data-bookmark-type="folder"]');
    for (var elem = event.target; (elem) && (elem !== this); elem = elem.parentNode) {
      if (Array.indexOf(targets, elem) >= 0) {
        var li = elem;

        var bookmark = bookmarks[parseInt(li.getAttribute("data-index-num"), 10)];
        setBookmarksPath((bookmark)? bookmark.id : undefined);
        break;
      }
    }
  }, false);
  document.querySelector("#passwords ul").addEventListener("click", function (event) {
    var targets = this.querySelectorAll('li');
    for (var elem = event.target; (elem) && (elem !== this); elem = elem.parentNode) {
      if (Array.indexOf(targets, elem) >= 0) {
        var li = elem;

        var password = passwords[parseInt(li.getAttribute("data-index-num"), 10)];

        document.querySelector("#passwords-action-menu > header h1").innerHTML = password.hostname;
        document.querySelector("#passwords-action-username").value = password.username;
        document.querySelector("#passwords-action-password").value = password.password;

        setCurrentSection("#passwords-action-menu");
        document.querySelector('#passwords-action-password').focus();
        document.querySelector('#passwords-action-password').select();
        break;
      }
    }
  }, false);
  Array.forEach(document.querySelectorAll('#passwords-action-menu input[type="text"]'), function (v) {
    v.addEventListener("focus", function (event) {
      event.target.select();
    }, false);
  });
  document.querySelector("#passwords-action-menu svg feTurbulence").setAttribute("seed", Math.random() * 1000);

}, false);
