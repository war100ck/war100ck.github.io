;(function($, Lampa) {
    /* CSS стили */
    const css = `
<style>
    /* Modern Modal Styling */
    .modal {
        background: rgba(0, 0, 0, 0.85) !important;
        backdrop-filter: blur(10px) !important;
        display: flex !important;
        align-items: center;
        justify-content: center;
        padding: 10px !important;
    }

    .modal__content {
        background: linear-gradient(145deg, #1a1a1f, #2a2a35) !important;
        border-radius: 12px !important;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        transform: scale(0.95);
        animation: modalEnter 0.3s ease-out forwards;
        max-width: 450px !important;
        width: 90% !important;
    }

    @keyframes modalEnter {
        100% { transform: scale(1); opacity: 1; }
    }

    .modal__title {
        font-size: 20px !important;
        padding: 15px 20px !important;
        font-weight: 500 !important;
        letter-spacing: 0.3px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    .modal__body {
        padding: 15px 20px !important;
    }

    .broadcast__text {
        margin-bottom: 15px !important;
    }

    .broadcast__text span {
        margin-bottom: 8px !important;
        font-size: 14px !important;
        padding: 10px 15px !important;
    }

    .modal__footer {
        gap: 10px !important;
        padding: 15px 20px !important;
    }

    .modal__button {
        padding: 10px 15px !important;
        font-size: 13px !important;
        letter-spacing: 0.2px !important;
    }

    .modal__button.focus {
        transform: scale(1.03) !important;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.5) !important;
    }

    .broadcast__scan {
        height: 6px !important;
        margin: 15px 0 !important;
    }
</style>
`;
 
    // Добавляем стили в документ
    document.head.insertAdjacentHTML('beforeend', css);

    var Modal = /** @class */function(){
    var modalID = 0;

    function Modal(params) {
        this.id = ++modalID;
        this.active = params;
        this.html = Lampa.Template.get('modal', {title: params.title});
        this.scroll = new Lampa.Scroll({over: true, mask: params.mask});
        this.last = false;
    }

    Modal.prototype.open = function(){
        var _this = this;
        this.html.on('click',function(e){
            if(!$(e.target).closest($('.modal__content', _this.html)).length && Lampa.DeviceInput.canClick(e.originalEvent)) window.history.back();
        })

        this.title(this.active.title);

        this.html.toggleClass('modal--medium', this.active.size === 'medium');
        this.html.toggleClass('modal--large', this.active.size === 'large');
        this.html.toggleClass('modal--full', this.active.size === 'full');
        this.html.toggleClass('modal--overlay', !!this.active.overlay);
        this.html.toggleClass('modal--align-center', this.active.align === 'center');

        if(this.active.zIndex) this.html.css('z-index', this.active.zIndex);

        this.scroll.render().toggleClass('layer--height', this.active.size === 'full')

        this.html.find('.modal__body').append(this.scroll.render())

        this.bind(this.active.html);

        this.scroll.onWheel = function(step){
            this.roll(step > 0 ? 'down' : 'up');
        }
        this.scroll.append(this.active.html);
        if(this.active.buttons) this.buttons();
        $('body').append(this.html);
        this.max();
        this.toggle(this.active.select);
    }

    Modal.prototype.max = function(){
        this.scroll.render().find('.scroll__content').css('max-height',  Math.round(window.innerHeight - this.scroll.render().offset().top - (window.innerHeight * 0.1)) + 'px');
    }

    Modal.prototype.buttons = function(){
        var footer = $('<div class="modal__footer"></div>');
        this.active.buttons.forEach(function(button){
            var btn = $('<div class="modal__button selector" style="width: 50%;text-align: center"></div>');
            btn.text(button.name);
            btn.on('click hover:enter',function(){
                button.onSelect();
            });
            footer.append(btn);
        });
        this.scroll.append(footer);
    }

    Modal.prototype.bind = function(where){
        where.find('.selector')
            .on('hover:focus',function(e){
                this.last = e.target;
                this.scroll.update($(e.target));
            })
            .on('hover:enter',function(e){
                this.last = e.target;
                if(this.active.onSelect) this.active.onSelect($(e.target));
            })
        ;
    }

    Modal.prototype.jump = function(tofoward){
        var select = this.scroll.render().find('.selector.focus');

        if(tofoward) select = select.nextAll().filter('.selector');
        else         select = select.prevAll().filter('.selector');

        select = select.slice(0,10);
        select = select.last();

        if(select.length){
            Lampa.Controller.collectionFocus(this.select[0],this.scroll.render());
        }
    }

    Modal.prototype.roll = function(direction){
        var select = this.scroll.render().find('.selector');

        if(select.length){
            Navigator.move(direction);
        }
        else{
            var step = Math.round(window.innerHeight * 0.15);

            this.scroll.wheel(direction === 'down' ? step : -step);
        }
    }

    Modal.prototype.toggle = function(need_select){
        var _this = this;
        Lampa.Controller.add('Modal-' + this.id, {
            invisible: true,
            toggle: function(){
                Lampa.Controller.collectionSet(_this.scroll.render());
                Lampa.Controller.collectionFocus(need_select || _this.last, _this.scroll.render());

                Lampa.Layer.visible(_this.scroll.render(true));
            },
            up: function(){
                _this.roll('up');
            },
            down: function(){
                _this.roll('down');
            },
            right: function(){
                if(Navigator.canmove('right')) Navigator.move('right');
                else _this.jump(true);
            },
            left: function(){
                if(Navigator.canmove('left')) Navigator.move('left');
                else _this.jump(false);
            },
            back: function(){
                if(_this.active.onBack) _this.active.onBack();
            }
        });
        Lampa.Controller.toggle('Modal-' + this.id);
    }

    Modal.prototype.update = function(new_html) {
        this.last = false;
        this.scroll.clear();
        this.scroll.append(new_html);
        this.bind(new_html);
        this.max();
        this.toggle(this.active.select);
    }

    Modal.prototype.title = function(title){
        this.html.find('.modal__title').text(title);
        this.html.toggleClass('modal--empty-title',!title);
    }

    Modal.prototype.destroy = function(){
        this.last = false;
        this.scroll.destroy();
        this.html.remove();
    }

    Modal.prototype.close = function(){
        this.destroy();
    }

    Modal.prototype.render = function(){
        return this.html;
    }
    return Modal;
    }();

    Lampa.Lang.add({
        ts_preload_preload: {
            en: 'Preload',
            ru: 'Предзагрузка',
            be: 'Перадзагрузка',
            uk: 'Передзавантаження',
            pt: 'Pré-carregar',
            zh: '预加载'
        },
        ts_preload_speed: {
            en: 'Speed',
            ru: 'Скорость загрузки',
            be: 'Хуткасць загрузкі',
            uk: 'Швидкість',
            pt: 'Velocidade',
            zh: '速度'
        },
        ts_preload_seeds: {
            en: 'seeds',
            ru: 'раздают',
            be: 'раздаюць',
            uk: 'роздають',
            pt: 'entregam',
            zh: '种子数'
        },
        ts_preload_peers: {
            en: 'Peers',
            ru: 'Подключились',
            be: 'Падключыліся',
            uk: 'Підключилися',
            pt: 'Conectado',
            zh: '连接数'
        }
    });

    function tsIP(){
        return (!!Lampa.Torserver && !!Lampa.Torserver.ip)
            ? Lampa.Torserver.ip()
            : Lampa.Storage.get(Lampa.Storage.field('torrserver_use_link') === 'two' ? 'torrserver_url_two' : 'torrserver_url');
    }

    if (!!Lampa.Torserver && !!Lampa.Torserver.stream && !!Lampa.Torserver.url) {
        Lampa.Torserver.stream = function(path, hash, id) {
            return Lampa.Torserver.url() + '/stream/'+ encodeURIComponent(path.split('\\').pop().split('/').pop()) +'?link=' + hash + '&index=' + id + '&play'
        }
    }

    var lampaPlay = Lampa.Player.play;
    var lampaCallback = Lampa.Player.callback;
    var lampaPlaylist = Lampa.Player.playlist;
    var lampaStat = Lampa.Player.stat;
    var player = null;

    var Player = /** @class */function(){
        function Player(data) {
            data.url = parseUrl(data.url).clearUrl + '&play';
            this.playerData = data;
            this.playList = null;
            this.statUrl = null;
            this.callback = null;
        }
        Player.prototype.setPlayList = function(playlist){
            playlist.map(function(data){data.url = parseUrl(data.url).clearUrl + '&play'});
            this.playList = playlist;
        };
        Player.prototype.setStatUrl = function(url){this.statUrl = url};
        Player.prototype.setCallback = function(callback){this.callback = callback};
        Player.prototype.play = function(){
            lampaPlay(this.playerData);
            this.playList && lampaPlaylist(this.playList);
            this.callback && lampaCallback(this.callback);
            this.statUrl && lampaStat(this.statUrl);
            player = null;
        }
        return Player;
    }();

    Lampa.Player.playlist = function(playlist) {
        if (player) player.setPlayList(playlist);
        else lampaPlaylist(playlist);
    };

    Lampa.Player.stat = function(url) {
        if (player) player.setStatUrl(url);
        else lampaStat(url);
    };

    Lampa.Player.callback = function(callback) {
        if (player) player.setCallback(callback);
        else lampaCallback(callback);
    };

    Lampa.Player.play = function(data) {
        if (Lampa.Storage.field('torrserver_preload')
            && data.url
            && tsIP()
            && data.url.indexOf(tsIP()) > -1
            && (
                Lampa.Storage.field('player_timecode') === 'again'
                || !data.timeline || !data.timeline.time
                || parseFloat('0' + data.timeline.time) < 60
                || true
            )
        ) preload(data);
        else lampaPlay(data);
    };

    function params(obj) {
        var prop, pairs = [];
        for (prop in obj) pairs.push(prop + (obj[prop] ? '=' + obj[prop] : ''));
        return pairs.join('&');
    }

    function parseUrl(url) {
        var m, base_url, stream, args, arg = {};
        if (!!(m = url.match(/^(https?:\/\/.+?)(\/stream\/[^?]+)\?(.+)$/i))) {
            base_url = m[1];
            stream = m[2];
            args = m[3];
            args.split('&').map(function(v){var p=v.split('=');arg[p[0]] = p[1] || null;});
            delete(arg['play']);delete(arg['preload']);delete(arg['stat']);
        }
        args = params(arg);
        return {
            clearUrl: base_url + stream + '?' + args,
            base_url: base_url,
            stream: stream,
            args: '?' + args,
            arg: arg
        }
    }

    function preload(data) {
        var u = parseUrl(data.url);
        if (!u.arg.link) return lampaPlay(data);
        player = new Player(data);
        var controller = Lampa.Controller.enabled().name;
        var network = new Lampa.Reguest();
        var modalHtml = $('<div>' + 
            '<div class="broadcast__text">' +
                '<span class="js-peer">&nbsp;</span>' +
                '<span class="js-buff">&nbsp;</span>' +
                '<span class="js-speed">&nbsp;</span>' +
            '</div>' + 
            '<div class="broadcast__scan"><div></div></div>' + 
            '</div>');
        var peer = modalHtml.find('.js-peer');
        var buff = modalHtml.find('.js-buff');
        var speed = modalHtml.find('.js-speed');
        var progressBar = modalHtml.find('.broadcast__scan div');
        
        var modal = new Modal({
            title: Lampa.Lang.translate('loading'),
            html: modalHtml,
            onBack: cancel,
            buttons: [
                {
                    name: Lampa.Lang.translate('cancel'),
                    onSelect: cancel
                },
                {
                    name: Lampa.Lang.translate('player_lauch'),
                    onSelect: play
                }
            ]
        });
        
        modal.open();

        function destroy() {
            network.clear();
            modal.close();
            Lampa.Controller.toggle(controller);
        }

        function cancel(){
            if (player) {
                destroy();
                player.callback && player.callback();
                player = null;
            }
        }

        function play(){
            if (player) {
                destroy();
                player.play();
            }
        }

        network.timeout(1800 * 1000);
        network.silent(u.clearUrl + '&preload', play, play);
        network.timeout(2000);

       var stat = function(data) {
    if (!player) return;
    if (data && data.Torrent) {
        var t = data.Torrent;
        var p = Math.floor((t.preloaded_bytes || 0) * 100 / (t.preload_size || 1));
        
        // Фиксируем ширину, чтобы она не уменьшалась
        var currentWidth = parseFloat(progressBar.css('width')) || 0;
        if (p > currentWidth) {
            progressBar.css('width', p + '%');
        }
        
        peer.html(Lampa.Lang.translate('ts_preload_peers') + ': ' + 
            (t.active_peers || 0) + ' / ' + 
            (t.pending_peers || 0) + ' (' + 
            (t.total_peers || 0) + ') &bull; ' + 
            (t.connected_seeders || 0) + ' - ' + 
            Lampa.Lang.translate('ts_preload_seeds'));
        
        buff.html(Lampa.Lang.translate('ts_preload_preload') + ': ' + 
            Lampa.Utils.bytesToSize(t.preloaded_bytes || 0) + ' / ' + 
            Lampa.Utils.bytesToSize(t.preload_size || 0) + ' (' + p + '%)');
        
        speed.text(Lampa.Lang.translate('ts_preload_speed') + ': ' + 
            Lampa.Utils.bytesToSize((t.download_speed || 0) * 8, true));
    }
    // Обновление статистики
    network.silent(u.base_url + '/cache', stat, stat, JSON.stringify({action: 'get', hash: u.arg.link}));
};

        // Инициализация начальных значений
        stat({Torrent: {
            active_peers: 0,
            pending_peers: 0,
            total_peers: 0,
            connected_seeders: 0,
            preloaded_bytes: 0,
            preload_size: 0,
            download_speed: 0
        }});
    }
})(jQuery, Lampa);