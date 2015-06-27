$(function () {
  var P = require("p-promise");
  var Sync = require("fx-sync")();
  var sync = undefined;
  var bookmarks = undefined;
  var passwords = undefined;

  function setCurrentSection(panel) {
    var panel = $(panel);
    var current = $('section.current[role="region"]');
    if (panel.hasClass("previous")) {
      current.removeClass("current");
      panel.removeClass("previous").addClass("current");
    } else {
      current.removeClass("current").addClass("previous");
      panel.addClass("current");
    }
  }
  function setBookmarks(aBookmarks) {
    bookmarks = aBookmarks;
    if (bookmarks.length == 0) { return; }

    var list = $("#bookmarks article ul");
    list.empty();
    console.debug(bookmarks); // TODO to be removed
    bookmarks.forEach(function (bookmark, index, bookmarks) {
      if (bookmark.type != "query") {
        var item = $($.parseHTML('<li><a href="javascript:void(0);"><p></p><p></p></a></li>'));
        $("a:link", item).prop("href", bookmark.bmkUri);
        $("a:link p:first-child", item).text(bookmark.title);
        $("a:link p:last-child", item).text(bookmark.bmkUri);
        item.data("index-num", index);
        list.append(item);
      }
    });
  }
  function setPasswords(aPasswords) {
    passwords = aPasswords;
    if (passwords.length == 0) { return; }

    var list = $("#passwords article ul");
    list.empty();
    console.debug(passwords); // TODO to be removed
    passwords.forEach(function (password, index, passwords) {
      var item = $($.parseHTML('<li><p></p><p></p></li>'));
      $("p:first-child", item).text(password.hostname);
      $("p:last-child", item).text(password.username);
      item.data("index-num", index);
      list.append(item);
    });
  }

  $("*[data-type=sidebar] menu[type=toolbar] a:link").on("click", function () {
    $("#content").removeClass("sidebar-opened");
  });
  $("a.sidebar-toggle:link").on("click", function () {
    $("#content").toggleClass("sidebar-opened");
  });
  $(".pack-checkbox-box .pack-checkbox ~ span, .pack-radio-box .pack-radio ~ span, .pack-switch-box .pack-switch ~ span").on("click", function (event) {
    var check = $('input[type="checkbox"], input[type="radio"]', event.currentTarget.parentNode);
    check.prop("checked", !check.prop("checked"));
    check.change();
  });

  $("#signin-form *[disabled]").prop("disabled", false);
  $("#signin-form").on("submit", function (event) {
    var signinForm = $("#signin-form");
    $("input, button", signinForm).prop("disabled", true);
    $("#signin-progress").removeClass("hidden");
    event.preventDefault();

    function failSignin(error) {
      utils.status.show("ERROR: " + error.message);

      $("input, button", signinForm).prop("disabled", false);
      $("#signin-progress").addClass("hidden");
    }

    var email = $('input[name="email"]', signinForm).val();
    var password = $('input[name="password"]', signinForm).val();
    var ownCloud = $('input[name="own-cloud"]', signinForm).val();
    var fxaServerUrl = (ownCloud)? $('input[name="fxaServerUrl"]', signinForm).val() : undefined;
    var syncAuthUrl = (ownCloud)? $('input[name="syncAuthUrl"]', signinForm).val() : undefined;

    try {
      sync = new Sync({ email: email, password: password }, { fxaServerUrl: fxaServerUrl, syncAuthUrl: syncAuthUrl });
      sync.fetch("bookmarks").then(function (results) {
        setBookmarks(results);

        return sync.fetch("passwords");
      }).then(function (results) {
        setPasswords(results);

        return P();
      }).done(function () {
        utils.status.show("Signed in");
        setCurrentSection("#storage-menu");
      }, function (error) {
        failSignin(error);
        $('input[name="password"]', signinForm).focus();
      });
    } catch (ex) {
      failSignin(ex);
    }
  });
  $('#signin-form input[name="own-cloud"]').on('change', function (event) {
    if ($(event.currentTarget).prop("checked")) {
      $("#signin-own-cloud-box").removeClass("collapse");
    } else {
      $("#signin-own-cloud-box").addClass("collapse");
    }
  }).trigger("change");

  $("a.btn-back:link, #storage-menu ul a:link").on("click", function (event) {
    var target = $($(event.currentTarget).prop("hash"));
    setCurrentSection(target);
    event.preventDefault();
  });

  $("#passwords ul").on("click", "li", function (event) {
    var li = $(event.target).parentsUntil("ul").last();
    var password = passwords[parseInt(li.data("index-num"), 10)];

    $("#passwords-action-menu > header h1").text(password.hostname);
    $("#passwords-action-username").val(password.username);
    $("#passwords-action-password").val(password.password);

    setCurrentSection("#passwords-action-menu");
    $('#passwords-action-password').select();
  });
  $("#passwords-action-menu form").on("submit", function (event) {
    event.preventDefault();
  });
  $('#passwords-action-menu input[type="text"]').on("focus", function (event) {
    $(event.target).select();
  });
});
