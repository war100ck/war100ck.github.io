(function () {
    'use strict';

    var timer = setInterval(function(){
        if(typeof Lampa !== 'undefined'){
            clearInterval(timer);
			start();
        }
    },10);

	function start(){
        var net = new Lampa.Reguest();

        Lampa.Listener.follow('view',function(e){
            if(e.type == 'start'){
                Lampa.Storage.set('events',[]);

                var query = [];
                var email = Lampa.Storage.get('account_email');

                query.push('id='+e.data.movie.id);

                if(e.data.movie.imdb_id)      query.push('imdb_id='+(e.data.movie.imdb_id || ''));
                if(e.data.movie.kinopoisk_id) query.push('kinopoisk_id='+(e.data.movie.kinopoisk_id || ''));

                query.push('serial='+(e.data.movie.name ? 1 : 0));
                query.push('uid='+Lampa.Storage.get('device_uid'));
                query.push('source=' + Lampa.Storage.field('source'));
				
                query.push('title=' + encodeURIComponent(e.data.movie.title || e.data.movie.name));
                query.push('original_title=' + encodeURIComponent(e.data.movie.original_title || e.data.movie.original_name));
				query.push('original_language='+(e.data.movie.original_language || ''));
                query.push('year='+((e.data.movie.release_date || e.data.movie.first_air_date || '0000') + '').slice(0,4));

                if(email) query.push('account_email='+encodeURIComponent(email));
				

                net.timeout(12000);
                net.silent('{localhost}/events?'+query.join('&'),function(j){
                    if(j.accsdb){
                        $('.videos__body').empty().append('<div style="background: #d81f26; padding: 15px 20px; border-radius: 5px; font-size: 1.1em; line-height: 1.5; margin-bottom: 1.5em;">'+j.msg+'</div>');
                    }
                    else{
                        Lampa.Storage.set('events',j);

                        $('.videos__plugins > .videos__button').remove();

                        j.forEach(function(p){
    						if (p.show == false)
    							$('.videos__plugins > .videos__tab:contains("'+p.name+'")').css('opacity', 0.9).css('color', '#a85457');
                        })

                        $('.videos__plugins > .videos__tab').eq(0).trigger('hover:enter');
                    }
                })
            }
            if(e.type == 'build' && e.name == 'videos'){
                e.body.find('.videos__button').remove();
                e.body.find('.videos__body').append('<div class="videos__loading">Загрузка... <span></span></div>');
            }
            if(e.type == 'destroy') 
                net.clear();
        });
    }
})();