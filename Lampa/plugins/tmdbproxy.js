(function () {
    'use strict';

    function account(url){
      var email = Lampa.Storage.get('account_email')
      if(email) url = Lampa.Utils.addUrlComponent(url,'account_email=' + encodeURIComponent(email))
      return url
    }

    Lampa.TMDB.image = function (url) {
      var base = Lampa.Utils.protocol() + 'image.tmdb.org/' + url;
      return Lampa.Storage.field('proxy_tmdb') ? '{localhost}/proxyimg/' + account(base) : base;
    };

    Lampa.TMDB.api = function (url) {
      var base = Lampa.Utils.protocol() + 'api.themoviedb.org/3/' + url;
      return Lampa.Storage.field('proxy_tmdb') ? '{localhost}/proxy/' + account(base) : base;
    };

    Lampa.Settings.listener.follow('open', function (e) {
      if (e.name == 'tmdb') {
        e.body.find('[data-parent="proxy"]').remove();
      }
    });

})();