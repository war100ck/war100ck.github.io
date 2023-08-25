(function () {
    'use strict';

    function Dlna(object) {
      var network = new Lampa.Reguest();
      var scroll = new Lampa.Scroll({
        mask: true,
        over: true
      });
      var last;
      var html = $('<div></div>');
      var body = $('<div class="category-full lampac-dnla-files"></div>');
      var head = $('<div class="lampac-dnla-head"></div>');
      var path = [];
      var managers = [];
      var managers_timer;
      var media_formats = ['asf', 'wmv', 'divx', 'avi', 'mp4', 'm4v', 'mov', '3gp', '3g2', 'mkv', 'trp', 'tp', 'mts', 'mpg', 'mpeg', 'dat', 'vob', 'rm', 'rmvb', 'm2ts', 'ts'];
      var icon_back = "<svg width=\"27\" height=\"27\" viewBox=\"0 0 27 27\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n        <path d=\"M0.772278 13.4178L13.2417 6.21863V20.617L0.772278 13.4178Z\" fill=\"white\"/>\n        <rect x=\"13.2416\" y=\"10.0508\" width=\"12.6296\" height=\"6.73407\" fill=\"white\"/>\n    </svg>";
      var icon_folder = "<svg width=\"43\" height=\"43\" viewBox=\"0 0 43 43\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n        <rect x=\"6.10352e-05\" y=\"5.39496\" width=\"42.7872\" height=\"31.9492\" rx=\"4\" fill=\"white\"/>\n        <rect x=\"2.89471\" y=\"2.18591\" width=\"36.9979\" height=\"27.6263\" rx=\"4\" fill=\"white\" fill-opacity=\"0.45\"/>\n        <path d=\"M7.5722 2.18591H35.2151C34.5457 0.913208 33.2105 0.0453491 31.6727 0.0453491H11.1147C9.57678 0.0453491 8.24164 0.913208 7.5722 2.18591Z\" fill=\"white\" fill-opacity=\"0.24\"/>\n    </svg>";
      var icon_play = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:svgjs=\"http://svgjs.com/svgjs\" version=\"1.1\" width=\"512\" height=\"512\" x=\"0\" y=\"0\" viewBox=\"0 0 30.051 30.051\" xml:space=\"preserve\">\n        <path d=\"M19.982,14.438l-6.24-4.536c-0.229-0.166-0.533-0.191-0.784-0.062c-0.253,0.128-0.411,0.388-0.411,0.669v9.069   c0,0.284,0.158,0.543,0.411,0.671c0.107,0.054,0.224,0.081,0.342,0.081c0.154,0,0.31-0.049,0.442-0.146l6.24-4.532   c0.197-0.145,0.312-0.369,0.312-0.607C20.295,14.803,20.177,14.58,19.982,14.438z\" fill=\"#ffffff\"/>\n        <path d=\"M15.026,0.002C6.726,0.002,0,6.728,0,15.028c0,8.297,6.726,15.021,15.026,15.021c8.298,0,15.025-6.725,15.025-15.021   C30.052,6.728,23.324,0.002,15.026,0.002z M15.026,27.542c-6.912,0-12.516-5.601-12.516-12.514c0-6.91,5.604-12.518,12.516-12.518   c6.911,0,12.514,5.607,12.514,12.518C27.541,21.941,21.937,27.542,15.026,27.542z\" fill=\"#ffffff\"/>\n    </svg>";
      var icon_file = "<svg width=\"37\" height=\"37\" viewBox=\"0 0 37 37\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n        <rect x=\"5.87271\" y=\"2.84418\" width=\"25\" height=\"31\" rx=\"2.5\" stroke=\"white\" stroke-width=\"3\"/>\n        <rect x=\"10.3727\" y=\"8.34418\" width=\"16\" height=\"3\" rx=\"1.5\" fill=\"white\"/>\n        <rect x=\"10.3727\" y=\"14.3442\" width=\"16\" height=\"3\" rx=\"1.5\" fill=\"white\"/>\n    </svg>\n    ";
      function account(url) {
        if (url.indexOf('account_email') == -1) {
          var email = Lampa.Storage.get('account_email');
          if (email) url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email));
        }
        return url;
      }
      this.create = function () {
        Lampa.Background.immediately('');
        path.push({
          name: 'Главная',
          url: window.lampac_dlna_adres
        });
        html.append(head);
        html.append(scroll.render());
        scroll.append(body);
        scroll.minus(head);
        this.load(path[path.length - 1].url);
        this.road();
        this.managers();
        return this.render();
      };
      this.road = function () {
        head.empty().html('<div>' + path.map(function (p) {
          return p.name;
        }).join(' / ') + '</div>');
      };
      this.clear = function () {
        last = false;
        body.empty();
        scroll.reset();
        this.activity.loader(false);
      };
      this.draw = function (data) {
        this.clear();
        if (path.length > 1) {
          Lampa.Arrays.insert(data, 0, {
            type: 'folder',
            name: 'Назад',
            back: true
          });
        }
        this.append(data);
        this.progress();
        this.activity.toggle();
      };
      this.empty = function (msg) {
        var empty = new Lampa.Empty({
          title: msg ? 'Ошибка' : '',
          descr: msg
        });
        html.empty().append(empty.render());
        this.start = empty.start;
        this.activity.loader(false);
        this.activity.toggle();
      };
      this.load = function (url) {
        var _this = this;
        this.activity.loader(true);
        network.clear();
        network.timeout(5000);
        network["native"](account(url), function (data) {
          if (path.length == 1 && data.accsdb) {
            _this.empty(data.msg);
          } else if (data.length) _this.draw(data);else _this.empty();
        }, function () {
          if (path.length == 1) {
            _this.empty();
          } else {
            _this.draw([]);
          }
        });
      };
      this.managers = function () {
        var _this2 = this;
        var update = function update() {
          network.timeout(3000);
          network["native"](account(window.lampac_dlna_adres + '/tracker/managers'), function (data) {
            managers = data;
            _this2.progress();
          });
        };
        managers_timer = setInterval(update, 10000);
        update();
      };
      this.findManager = function (file_name) {
        var finded;
        var manager = managers.find(function (f) {
          return f.name == file_name;
        });
        if (manager) finded = {
          percent: manager.partialProgress,
          speed: manager.monitor.downloadSpeed,
          hash: manager.infoHash
        };else {
          for (var m = 0; m < managers.length; m++) {
            if (managers[m].files) {
              var _manager = managers[m].files.find(function (f) {
                return f.path == file_name;
              });
              if (_manager) {
                finded = {
                  percent: _manager.bytesDownloaded / _manager.length * 100,
                  speed: managers[m].monitor.downloadSpeed,
                  hash: managers[m].infoHash
                };
              }
            }
          }
        }
        return finded;
      };
      this.progress = function () {
        var self = this;
        body.find('.card').each(function () {
          var card = $(this);
          var name = card.data('name');
          var manager = self.findManager(name);
          var mahager_card = card.find('.lampac-dlna-manager');
          mahager_card.toggleClass('active', manager ? true : false);
          if (manager) {
            var percent = Math.round(manager.percent);
            if (isNaN(percent)) percent = 0;
            mahager_card.find('.lampac-dlna-manager__progress > div').css('width', percent + '%');
            mahager_card.find('.lampac-dlna-manager__percent').text(percent + ' %');
            mahager_card.find('.lampac-dlna-manager__speed').text(Lampa.Utils.bytesToSize(manager.speed * 8, true) + (Lampa.Storage.get('language') == 'en' ? '' : '/c'));
          }
          card.data('download', manager ? manager.hash : false);
        });
      };
      this.append = function (data) {
        var _this3 = this;
        data.forEach(function (element) {
          var card = Lampa.Template.get('card', {
            title: element.name
          });
          card.data('name', element.name);
          var icon = $('<div class="card__file-icon"></div>');
          var exe = (element.path || '').split('.').pop().toLowerCase();
          var play = media_formats.indexOf(exe) >= 0;
          var timeline = Lampa.Timeline.view(Lampa.Utils.hash(element.name));
          icon.append(element.type == 'folder' ? element.back ? icon_back : icon_folder : play ? icon_play : icon_file);
          card.addClass('card--collection');
          card.find('.card__view').append(icon);
          card.find('.card__img').attr('src', element.img ? account(element.img) : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E");
          if (element.type == 'file') card.find('.card__view').append('<div class="card__type"><div>' + Lampa.Utils.bytesToSize(element.length) + '</div></div>');
          card.find('.card__age').remove();
          card.find('.card__view').append("<div class=\"lampac-dlna-manager\">\n                <div class=\"lampac-dlna-manager__body\">\n                    <div class=\"lampac-dlna-manager__percent\"></div>\n                    <div class=\"lampac-dlna-manager__speed\"></div>\n                </div>\n\n                <div class=\"time-line lampac-dlna-manager__progress\"><div></div></div>\n            </div>");
          if (element.type == 'folder' && element.length) {
            card.find('.card__view').append('<div class="card__folder-files">' + element.length + '</div>');
          }
          card.on('hover:focus', function () {
            last = card[0];
            scroll.update(card, true);
          });
          card.on('hover:enter', function () {
            if (element.type == 'folder') {
              if (element.back) {
                _this3.back();
              } else {
                path.push({
                  name: element.name,
                  url: element.uri
                });
                _this3.load(element.uri);
              }
              _this3.road();
            } else if (play) {
              var subtitles = element.subtitles;
              if (subtitles && Lampa.Arrays.isArray()) {
                subtitles.forEach(function (s) {
                  s.url = account(s.url);
                });
              }
              var video = {
                title: element.name,
                url: account(element.uri),
                subtitles: subtitles,
                timeline: timeline
              };
              Lampa.Player.play(video);
              Lampa.Player.playlist([video]);
            }
          }).on('hover:long', function () {
            if (!element.back) {
              var download = card.data('download');
              Lampa.Select.show({
                title: download ? 'Остановить загрузку' : 'Удалить файл',
                items: [{
                  title: 'Да',
                  "delete": true
                }, {
                  title: 'Нет'
                }],
                onSelect: function onSelect(a) {
                  if (a["delete"]) {
                    if (download) {
                      network["native"](account(window.lampac_dlna_adres + '/tracker/delete?infohash=' + encodeURIComponent(download)), false, false, false, {
                        dataType: 'text'
                      });
                    } else {
                      var files = body.find('.card');
                      last = files.eq(files.index(card) - 1)[0];
                      card.remove();
                      network["native"](account(window.lampac_dlna_adres + '/delete?path=' + encodeURIComponent(element.path)), false, false, false, {
                        dataType: 'text'
                      });
                    }
                  }
                  Lampa.Controller.toggle('content');
                },
                onBack: function onBack() {
                  Lampa.Controller.toggle('content');
                }
              });
            }
          });
          body.append(card);
        });
      };
      this.back = function () {
        if (path.length > 1) {
          path.pop();
          this.load(path[path.length - 1].url);
        } else {
          Lampa.Activity.backward();
        }
      };
      this.start = function () {
        Lampa.Controller.add('content', {
          toggle: function toggle() {
            Lampa.Controller.collectionSet(scroll.render());
            Lampa.Controller.collectionFocus(last || false, scroll.render());
          },
          left: function left() {
            if (Navigator.canmove('left')) Navigator.move('left');else Lampa.Controller.toggle('menu');
          },
          right: function right() {
            if (Navigator.canmove('right')) Navigator.move('right');
          },
          up: function up() {
            if (Navigator.canmove('up')) Navigator.move('up');else Lampa.Controller.toggle('head');
          },
          down: function down() {
            if (Navigator.canmove('down')) Navigator.move('down');
          },
          back: this.back.bind(this)
        });
        Lampa.Controller.toggle('content');
      };
      this.pause = function () {};
      this.stop = function () {};
      this.render = function () {
        return html;
      };
      this.destroy = function () {
        clearInterval(managers_timer);
        network.clear();
        scroll.destroy();
        html.remove();
      };
    }

    window.lampac_dlna_adres = '{localhost}/dlna';
    function startPlugin() {
      window.plugin_lampac_dlna = true;
      Lampa.Template.add('lampac_dlna_css', "\n        <style>\n        .lampac-dnla-files .card__file-icon{left:50%;top:50%;width:5em;height:5em;margin-left:-2.5em;margin-top:-2.5em;background-color:transparent;-webkit-border-radius:0;border-radius:0;position:absolute}.lampac-dnla-files .card__file-icon>svg{width:5em !important;height:5em !important}.lampac-dnla-files .card__title{word-break:break-all;line-height:1.4;max-height:4.3em}.lampac-dnla-files .card__folder-files{position:absolute;top:50%;left:50%;width:3em;text-align:center;margin-left:-1.5em;margin-top:-0.5em;color:#000;font-size:1.5em;font-weight:700}.lampac-dnla-head{padding:2em 1.5em 1em 1.5em}.lampac-dnla-head>div{font-size:1.4em;font-weight:300;word-break:break-all}.lampac-dlna-manager{display:none;position:absolute;left:0;bottom:0;right:0;padding:1em}.lampac-dlna-manager__body{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between}.lampac-dlna-manager.active{display:block}\n        </style>\n    ");
      $('body').append(Lampa.Template.get('lampac_dlna_css', {}, true));
      Lampa.Component.add('lampac_dnla', Dlna);
      function account(url) {
        if (url.indexOf('account_email') == -1) {
          var email = Lampa.Storage.get('account_email');
          if (email) url = Lampa.Utils.addUrlComponent(url, 'account_email=' + encodeURIComponent(email));
        }
        return url;
      }
      function add() {
        var button = $("<li class=\"menu__item selector\" data-action=\"sisi\">\n            <div class=\"menu__ico\">\n                <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:svgjs=\"http://svgjs.com/svgjs\" width=\"512\" height=\"512\" x=\"0\" y=\"0\" viewBox=\"0 0 512 512\" xml:space=\"preserve\">\n                    <path d=\"M406,332c-29.641,0-55.761,14.581-72.167,36.755L191.99,296.124c2.355-8.027,4.01-16.346,4.01-25.124\n                        c0-11.906-2.441-23.225-6.658-33.636l148.445-89.328C354.307,167.424,378.589,180,406,180c49.629,0,90-40.371,90-90\n                        c0-49.629-40.371-90-90-90c-49.629,0-90,40.371-90,90c0,11.437,2.355,22.286,6.262,32.358l-148.887,89.59\n                        C156.869,193.136,132.937,181,106,181c-49.629,0-90,40.371-90,90c0,49.629,40.371,90,90,90c30.13,0,56.691-15.009,73.035-37.806\n                        l141.376,72.395C317.807,403.995,316,412.75,316,422c0,49.629,40.371,90,90,90c49.629,0,90-40.371,90-90\n                        C496,372.371,455.629,332,406,332z\" fill=\"currentColor\"></path>\n                </svg>\n            </div>\n            <div class=\"menu__text\">DLNA</div>\n        </li>");
        button.on('hover:enter', function () {
          Lampa.Activity.push({
            url: '',
            title: 'DLNA',
            component: 'lampac_dnla',
            page: 1
          });
        });
        $('.menu .menu__list').eq(0).append(button);
      }
      if (window.appready) add();else {
        Lampa.Listener.follow('app', function (e) {
          if (e.type == 'ready') add();
        });
      }
      if (Lampa.Manifest.app_digital >= 161) {
        var network = new Lampa.Reguest();
        Lampa.Listener.follow('torrent', function (data) {
          if (data.type == 'onlong') {
            var enabled = Lampa.Controller.enabled().name;
            data.menu.push({
              title: 'Загрузить в DLNA',
              onSelect: function onSelect() {
                Lampa.Controller.toggle(enabled);
                Lampa.Loading.start(function () {
                  network.clear();
                  Lampa.Loading.stop();
                }, 'Подождите...');
                var magnet = data.element.MagnetUri || data.element.Link;
                network["native"](account(window.lampac_dlna_adres + '/tracker/show?path=' + encodeURIComponent(magnet)), function (files) {
                  Lampa.Loading.stop();
                  if (files.length) {
                    var items = files.map(function (file, index) {
                      return {
                        title: file.path,
                        checkbox: true,
                        index: index,
                        checked: true
                      };
                    });
                    Lampa.Arrays.insert(items, 0, {
                      title: 'Начать загрузку'
                    });
                    Lampa.Select.show({
                      title: 'Выбрать файлы',
                      fullsize: true,
                      items: items,
                      onSelect: function onSelect(a) {
                        var select = items.filter(function (s) {
                          return s.checked;
                        }).map(function (s) {
                          return 'indexs=' + s.index;
                        }).join('&');
                        var thumb = '';
                        var movie = Lampa.Storage.get('activity').movie;
                        if (movie && movie.backdrop_path) {
                          thumb = Lampa.Api.img(movie.backdrop_path, 'w500');
                        }
                        if (select) {
                          Lampa.Loading.start(function () {
                            network.clear();
                          }, 'Подождите...');
                          network["native"](account(window.lampac_dlna_adres + '/tracker/download?path=' + encodeURIComponent(magnet) + '&' + select + '&thumb=' + encodeURIComponent(thumb)), function (result) {
                            Lampa.Loading.stop();
                            if (result.status) Lampa.Noty.show('Добавлено в загрузку');else Lampa.Noty.show('Ошибка при добавление в загрузку');
                            Lampa.Controller.toggle(enabled);
                          }, function () {
                            Lampa.Loading.stop();
                            Lampa.Noty.show('Ошибка при добавление в загрузку');
                            Lampa.Controller.toggle(enabled);
                          });
                        }
                        Lampa.Controller.toggle(enabled);
                      },
                      onBack: function onBack() {
                        Lampa.Controller.toggle(enabled);
                      }
                    });
                  } else {
                    Lampa.Noty.show('Не удалось получить данные');
                  }
                }, function () {
                  Lampa.Loading.stop();
                  Lampa.Noty.show('Не удалось получить данные');
                });
              }
            });
          }
        });
      }
    }
    if (!window.plugin_lampac_dlna) startPlugin();

})();
