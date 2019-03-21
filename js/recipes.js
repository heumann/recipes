var showing_reset = false;
var currently_displaying = '';

// do stuff when DOM is ready
$(document).ready(function() {
    var hash = window.location.hash;

    if ( hash ) {
      hash = hash.replace('#','');
      console.log( hash );
      $("#search_term").val( hash );
      $("#search_term").keyup();
    }


    $("#search_term").focus();

    set_escape_event();

    display_many( all_recipes );

    set_click_event();

    set_add_event();

    var last_search_term = '';
    var search_term = '';


    // monitor search box
    $("#search_term").keyup( function ( event ) {
        // do nothing if a function key was pressed
        if( last_search_term === $("#search_term").val() ) {
            return;
        }
        last_search_term = search( event );
    });

    // monitor reset button
    $("#search_right").click( function () {
        clear_search();
    });
});

function search ( event ) {
    search_term = $("#search_term").val().toLowerCase();
    window.location.hash = search_term;

    // if that key was esc, clear the search box and clear the reset button
    if ( event.keyCode == 27 ) {
        clear_search();
    }

    // if there's text in the box, display the reset button
    // if there's no text in the box, remove the reset button
    if( search_term.length > 0 && ! showing_reset ) {
        show_reset();
    }
    else if( search_term.length === 0 && showing_reset ) {
        hide_reset();
        return;
    }

    var search_results = new Object();
    var num_results = 0;

    // search the recipe titles
    $.each(all_recipes, function ( title, url ) {
        if ( title.replace( /_/g, ' ' ).match( search_term, 'gi' ) ) {
            search_results[title] = url;
            num_results++;
        }
    });

    if ( num_results === 0 ) {
        display_zero( search_term );
    }
    else if ( num_results === 1 ) {
        // this seems silly. there has to be a better way to get the one value out without knowing the key
        $.each(search_results, function ( title, url ) {
            if( title != currently_displaying ) {
                display_one( url );
                currently_displaying = title;
            }
        });
    }
    else {
        currently_displaying = '';
        display_many( search_results );
    }

    return $("#search_term").val();
}

function show_reset() {
    $("#search_right").css( 'background', "white url('images/search_right_x.gif') no-repeat top left" );
    showing_reset = true;
}

function hide_reset() {
    $("#search_right").css( 'background', "white url('images/search_right.gif') no-repeat top left" );
    showing_reset = false;
    display_many( all_recipes );
}

// display more than one recipe
function display_many( recipes ) {
    clear_results();

    $("#results").append('<ul>');

    $.each(recipes, function ( title, url ) {
        title = title.replace( /_/g, ' ' );
        title = title.replace( /\.\w+$/g, ' ' );

        var jpg_img = '';
        if( url.match( /\.jpg$/ ) ) {
            jpg_img = '<img src="images/jpeg-icon.png" width="13" height="16" />';
        }

        $("#results").append(
            '<li><a class="recipe-link" href="' + url + '">'+ title + jpg_img + '</a><a href="' + url + '"><img src="images/arrow.gif" width="12" height="12" /></a></li>'
        );
    });
}

function display_zero( search_term ) {
    clear_results();
    $("#results").append("<p>Oops, there aren't any recipes that match <em>" + search_term + "</em>. Please try your search again.</p>");
}

function display_one( url ) {
    clear_results();

    $("#results").append('<a class="permlink" href="' + url + '">permanent link to this recipe</a><br />');

    if( url.match( /\.jpg$/ ) ) {
        $("#results").append('<img src="' + url + '" />');
    }
    else {
        $.get(url, function( data ){
            //grab the url if there is one
            data = data.replace( /(http.*)\n/, '<a target="_blank" href="$1">$1</a>' );

            data = data.replace( /\n/g, '<br />' );
            $("#results").append('<p class="display_recipe">' + data + '</p>');
        });
    }
}

// clear the results div
function clear_results() {
    $("#results").html( '' );
}

// clear the search box
function clear_search() {
    $("#search_term").val( '' );
    $("#search_term").focus();
    window.location.hash = '';
    //display_many( all_recipes );
    hide_reset();
}

// click a link, see the recipe (on the same page, not in a new page)
function set_click_event() {
    $(".recipe-link").live( 'click', function ( eventObject ) {
        display_one( eventObject.target.href );
        $("#search_term").val( eventObject.target.text );
        show_reset();
        return false;
    });
}

// when the esc key is pressed, clear the input box
function set_escape_event() {
    $(document).keyup( function ( eventObject ) {
        if ( eventObject.keyCode == 27 ) {
            if ( $("#lightbox-screen").css('opacity') > 0 ) {
                clear_add();
            }
            else {
                clear_search();
            }
        }
    });
}

function clear_add() {
    $("#lightbox-screen")
        .animate({ opacity: 0 })
        .height('0%')
        .width('0%');

    $('.lightbox').fadeOut(300, function() {
        // for some reason, doing this with a delay didn't work :(
        $(this).remove();
    });
}

function set_add_event() {
    // TODO it's kinda hacky that we alter the height and width of the screen.  we could change the z-index instead...
    $('#add-button').click( function () {
        $("#lightbox-screen")
            .height('100%')
            .width('100%')
            .animate({ opacity: 0.8 })
            .click(function () {
                clear_add();
            });

        var add_box = $('<div class="lightbox" />')
            .text('Sorry, adding recipes is restricted for now.')
            .load('add/index.html');

        $('body').append( add_box );
    })
    .mouseover(function() {
        $(this).css('cursor', 'hand');
    });
}
