#!/usr/bin/perl
use warnings;
use strict;

use Data::Dumper;
use CGI;

run();

sub run {
    print "Content-type:text/html\n\n";

    my $q = CGI->new;

    return unless _save_file(
        $q->param('title'),
        $q->param('source'),
        $q->param('recipe'),
    );
    _regenerate_json();

    print 'success' and return;
}

sub _save_file {
    my ( $title, $source, $recipe ) = @_;

    # TODO fix this absolute path
    (my $new_recipe_path = '/home/josh/dev/josh_svn/recipes/' . lc( $title ) ) =~ s/\s/ /g;

    if ( -e $new_recipe_path ) {
        print "error: duplicate recipe title" and return;
    }

    # fix the fact that the folder has to be world-writeable.
    open FH, ">$new_recipe_path" or print "error: can't open file $new_recipe_path. ($!)" and return;

    print FH sprintf(
        "%s\nvia %s\n\n%s", 
        $title,
        $source,
        $recipe,
    );

    close FH;

    return 1;
}

sub _regenerate_json {
    # fix these absolute paths
    # also fix the fact that this file has to be world-writeable. maybe make a group that can write to this file and put me/www-data in it?
   return `perl /home/josh/dev/josh_svn/dev/jhdc_features/recipe_handler/lib/recipe_json.pl > /home/josh/dev/josh_svn/dev/jhdc_features/recipe_handler/bin/js/recipes.json`;
}
