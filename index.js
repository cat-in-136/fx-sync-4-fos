$(function () {
  var Sync = require("fx-sync")();
  var sync = undefined;
  var bookmarks = undefined;

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

    var list = $("#bookmarks article ul");
    list.empty();
    console.debug(bookmarks);
    bookmarks.forEach(function (bookmark) {
      if (bookmark.type != "query") {
        var item = $.parseHTML('<li><a href="javascript:void(0);" target="_blank"><p></p><p></p></li>');
        $("a:link", item).prop("href", bookmark.bmkUri);
        $("a:link p:first-child", item).text(bookmark.title);
        $("a:link p:last-child", item).text(bookmark.bmkUri);
        list.append(item);
      }
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
      sync.fetch("bookmarks").then(function(results) {
        utils.status.show("Signed in");
        setCurrentSection("#storage-menu");

        setBookmarks(results);
      }, function (error) {
        failSignin(error);
        $('input[name="password"]', signinForm).focus();
      }).done();
    } catch (ex) {
      failSignin(ex);
    }
  });
  $('#signin-form input[name="own-cloud"]').on('change', function (event) {
    if ($(event.currentTarget).prop("checked")) {
      $("#signin-own-cloud-box").removeClass("none");
    } else {
      $("#signin-own-cloud-box").addClass("none");
    }
  });

  $("#storage-menu ul li a:link").on("click", function (event) {
    var target = $($(event.currentTarget).prop("hash"));
    setCurrentSection(target);
    event.preventDefault();
  });
  $("a.btn-back:link").on("click", function (event) {
    var target = $($(event.currentTarget).prop("hash"));
    setCurrentSection(target);
    event.preventDefault();
  });
});
