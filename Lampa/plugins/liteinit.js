(function () {
    'use strict';

    var timer = setInterval(function(){
        if(typeof Lampa !== 'undefined'){
            clearInterval(timer);
            start();
        }
    },10);

	function start(){
		
        var ctime = setTimeout(function(){
            $('[data-action="about"]').remove();

            $('.menu__logo').remove();
        },200);

        Lampa.Storage.set('source','cub');

        Lampa.Settings.listener.follow('open',function(e){
            /*if(e.name == 'main')
                e.body.find('[data-component="plugins"]').remove();*/
                
            if(e.name == 'more')
                e.body.find('[data-name="source"]').remove();
        });

        Lampa.Listener.follow('menu',function(e){
            if(e.type == 'start'){
                $('[data-action="about"]',e.body).remove();

                $('.menu__logo',e.body).remove();

                clearTimeout(ctime);
            }    
        });
		
		var plugins = [{initiale}]; // "{localhost}/dlna.js", "{localhost}/tracks.js"

        plugins.forEach(function(plugin){
			Lampa.Utils.putScript([plugin],function(){},function(){},function(){},true);
        });
    }
})();