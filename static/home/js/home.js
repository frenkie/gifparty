(function () {

    var partyPlace;

    var createPartyPlace = document.querySelector('.usage-step-1-button');
    var visitPartyPlace = document.querySelector('.usage-step-2-button');
    var visitRemote = document.querySelector('.usage-step-3-button');


    createPartyPlace.addEventListener( 'click', function () {

        var name = prompt('Name your epic party! (only letters, nrs and one of -_ are allowed, no spaces)');

        if ( /^[\w\-]+$/.test( name ) ) {

            partyPlace = name;

            visitPartyPlace.innerHTML = 'Visit \''+ partyPlace +'\'';
            visitPartyPlace.href ='/party/'+ partyPlace;
            visitPartyPlace.removeAttribute( 'disabled' );

            visitRemote.href ='/party/'+ partyPlace +'/remote';
            visitRemote.innerHTML = 'Open \''+ partyPlace +'\' remote';
            visitRemote.removeAttribute( 'disabled' );

        } else {
            alert( 'Enter a valid party place name please.' );
        }
    });
})();