(function () {
    'use strict';

    Lampa.Storage.set('torrserver_url','{localhost}/ts');
    Lampa.Storage.set('torrserver_auth','true');
    Lampa.Storage.set('torrserver_login',Lampa.Storage.get('account_email') || 'ts');
    Lampa.Storage.set('torrserver_password','ts');
	
})();