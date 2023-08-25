(function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  var Timecode = /*#__PURE__*/function () {
    function Timecode(field) {
      _classCallCheck(this, Timecode);
      this.localhost = '{localhost}/';
      this.network = new Lampa.Reguest();
    }
    _createClass(Timecode, [{
      key: "init",
      value: function init() {
        var _this = this;
        Lampa.Timeline.listener.follow('update', this.add.bind(this));
        Lampa.Listener.follow('full', function (e) {
          if (e.type == 'complite') _this.update();
        });
      }
    }, {
      key: "url",
      value: function url(method) {
        var url = this.localhost + 'timecode/' + method;
        var account = Lampa.Storage.get('account', '{}');
        var activity = Lampa.Storage.get('activity', '{}');
        var card = activity.movie || activity.card;
        var card_id = (card.id || 0) + '_' + (card.name ? 'tv' : 'movie');
        if (account.email) url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(account.email));
        if (account.profile) url = Lampa.Utils.addUrlComponent(url, 'profile=' + encodeURIComponent(account.profile.id));
        url = Lampa.Utils.addUrlComponent(url, 'card_id=' + encodeURIComponent(card_id));
        return url;
      }
    }, {
      key: "update",
      value: function update() {
        var url = this.url('all');
        this.network.silent(url, function (result) {
          if (result.accsdb) return;
          var viewed = Lampa.Storage.cache('file_view', 10000, {});
          for (var i in result) {
            var time = JSON.parse(result[i]);
            if (!Lampa.Arrays.isObject(time)) continue;
            viewed[i] = time;
            Lampa.Arrays.extend(viewed[i], {
              duration: 0,
              time: 0,
              percent: 0
            });
            delete viewed[i].hash;
          }
          Lampa.Storage.set('file_view', viewed, true);
        });
      }
    }, {
      key: "add",
      value: function add(e) {
        var url = this.url('add');
        this.network.silent(url, false, false, {
          id: e.data.hash,
          data: JSON.stringify(e.data.road)
        });
      }
    }]);
    return Timecode;
  }();
  function startPlugin() {
    window.lampac_timecode_plugin = true;
    if (Lampa.Timeline.listener) {
      var code = new Timecode();
      code.init();
    }
  }
  if (!window.lampac_timecode_plugin) startPlugin();

})();
