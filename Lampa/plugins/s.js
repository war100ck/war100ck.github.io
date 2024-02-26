(function() {
  'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
      return typeof obj;
    } : function(obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

var host = 'https://bwa.to';
  var hostcloud = ['https://bwa.to/cloud.js'];

  var framework = 'https://bwa.pages.dev';

  var plugins = ["s.js"];

  if (typeof WebAssembly == 'undefined' || window.blazor_error) {
    Lampa.Utils.putScriptAsync(hostcloud, function() {});
  } 
  else if (window.blazor_init) {
    Lampa.Utils.putScriptAsync(plugins.filter(function(u) {
      return (!window.bwajs_plugin && u == 'o.js') || (!window['plugin_sisi_pwa_ready'] && u == 's.js');
    }).map(function(u) {
      return host + '/plugins/' + u + plugins_version;
    }), function() {});
  } 
  else 
  {
    window.blazor_init = true;
    var s = document.createElement('script');
    s.onload = function() {
      if (typeof Blazor == 'undefined') {
        Lampa.Utils.putScriptAsync(hostcloud, function() {});
		window.blazor_error = true;
        return;
      }

      try {
        Blazor.start({
          loadBootResource: function loadBootResource(type, name, defaultUri, integrity) {
            return framework + '/' + name + framework_version;
          }
        }).then(function() {
          var net = new Lampa.Reguest();
          window.httpReq = function(url, post, params) {
            return new Promise(function(resolve, reject) {
              net["native"](url, function(result) {
                if (_typeof(result) == 'object') resolve(JSON.stringify(result));
                else resolve(result);
              }, reject, post, params);
            });
          };

          var check = function check(good) 
		  {
            try {
              DotNet.invokeMethodAsync("JinEnergy", 'initial').then(function(initial) 
			  {
                if (initial) {
                  console.log('BWA', 'check cors:', good);
                  var type = Lampa.Platform.is('android') ? 'apk' : good ? 'cors' : 'web';
                  var conf = host + '/settings/' + type + '.json';
                  DotNet.invokeMethodAsync("JinEnergy", 'oninit', type, conf);
                  Lampa.Utils.putScriptAsync(plugins.map(function(u) {
                    return host + '/plugins/' + u + plugins_version;
                  }), function() {});
                } else {
                  console.log('BWA', 'not initial');
				  window.blazor_error = true;
                  Lampa.Utils.putScriptAsync(hostcloud, function() {});
                }
              })["catch"](function(e) {
                console.log('BWA', e);
				window.blazor_error = true;
                Lampa.Utils.putScriptAsync(hostcloud, function() {});
              });
            } catch (e) {
              console.log('BWA', e);
			  window.blazor_error = true;
              Lampa.Utils.putScriptAsync(hostcloud, function() {});
            }
          };

          if (Lampa.Platform.is('android') || Lampa.Platform.is('tizen')) check(true);
          else {
            net.silent('https://github.com/', function() {
              check(true);
            }, function() {
              check(false);
            }, false, {
              dataType: 'text'
            });
          }
        })["catch"](function(e) {
          console.log('BWA', e);
		  window.blazor_error = true;
          Lampa.Utils.putScriptAsync(hostcloud, function() {});
        });
      } catch (e) {
        console.log('BWA', e);
		window.blazor_error = true;
        Lampa.Utils.putScriptAsync(hostcloud, function() {});
      }
    };
    s.setAttribute('autostart', 'false');
    s.setAttribute('src', framework + '/blazor.webassembly.js' + framework_version);
    document.body.appendChild(s);
  }
})();
