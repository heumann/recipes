var inputs = $(':input:not(:button):not(#search_term)');

inputs.live({
  focusin:  function() { enter_input( $(this) ) },
  focusout: function() { leave_input( $(this) ) }
});

$("#add-submit").live('click', function ( event ) {
    var button = $(this);

    // redoing this so it happens after the new form has been added to the DOM
    var inputs = $(':input:not(:button):not(#search_term)');

    var recipe_args = {};
    inputs.each(function () {
      var $this = $(this);
      if (
        $this.val() == $this.data('default_value')  // they left the default
        || $this.val() == ''                        // they left it blank
        || ! $this.data('default_value')            // they never touched it
      ) {
        $this.addClass('error');
      }

      recipe_args[ $this.attr('name') ] = $this.val();
    });

    if ( $('.error').length == 0 && $('.floaty-error').length == 0) {
      button.attr('disabled', 'disabled');
      $.ajax({
          url      : 'cgi-bin/add_recipe.cgi',
          type     : 'POST',
          data     : recipe_args,
          success  : function (response) {
            if ( response == 'success' ) {
              //window.location.reload()
              var new_title = $("input[name='title']").val().replace(' ', '_');
              all_recipes[ new_title ] = "http://joshheumann.com/recipes/recipe/" + new_title;
              all_recipes = sortObj( all_recipes );
              clear_add();
              display_many( all_recipes );
            }
          }
      });
    }
});

function enter_input ( input ) {
  input.removeClass('greyed').removeClass('error');

  if ( ! input.data('default_value') || input.val() == input.data('default_value') ) {
    input.data('default_value', input.val() );
    input.val('');
  }

  if ( input.attr('name') == 'title') {
    $('.floaty-error').remove();
  }
}

function leave_input ( input ) {
  if ( input.val() == '' ) {
    input
      .val( input.data('default_value') )
      .addClass('greyed');
  }

  if (
    input.attr('name') == 'title'
    && input.val(), all_recipes[ input.val().replace(' ', '_') ]
  ) {
    input.addClass('error');
    $('<span class="floaty-error">Oops! There is already a recipe with that title.  Can you differentiate this one?</span>').insertAfter( input );
  }
}

// taken from http://www.latentmotion.com/how-to-sort-an-associative-array-object-in-javascript/
function sortObj(arr){
  // Setup Arrays
  var sortedKeys = new Array();
  var sortedObj = {};

  // Separate keys and sort them
  for (var i in arr){
    sortedKeys.push(i);
  }
  sortedKeys.sort();

  // Reconstruct sorted obj based on keys
  for (var i in sortedKeys){
    sortedObj[sortedKeys[i]] = arr[sortedKeys[i]];
  }
  return sortedObj;
}
