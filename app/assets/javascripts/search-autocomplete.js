//= require algolia/v3/algoliasearch.min

var AlgoliaCityAutocomplete = function() {
	var client, index, 
			$input, $results, $cancel, 
			state, selectIndex,
			KEYBOARD = {
				UP: 38,
				DOWN: 40,
				ENTER: 13
			};

	var bindEvents = function() {
		$input.on('keyup', autocompleteSearch)
					.on('keydown', preventCursorFlickering)
					.on('focusin', autocompleteSearch)
          .on('focusout', resetAutocomplete);

		$cancel.on('click', cancelInput);

		$results.on('mousedown', 'li', function() {
			selectChoice($(this).index());
			resetAutocomplete();
		});

    $('#sidebar_content')
      .on('click', 'li', cancelInput);
	};

	var init = function(sel, resultSel) {
		client = algoliasearch('X4RSDH730N', '17a129595cc89afb49e0e0055c51ecef');
		index = client.initIndex('OpenStreetMap_Cities');

		$input = $(sel)
      .wrap('<div class="input-wrap"></div>');
    $results = $('body')
      .append('<ul class="algolia-autocomplete-results ' + resultSel + '"></ul>')
      .find('.algolia-autocomplete-results.' + resultSel);
    $cancel = $(sel)
      .parent()
      .append('<i class="icon-close"></i>')
      .find('.icon-close')
      .css('background-color', $input.css('background-color'));

		state = {
			results: [],
			displayResults: [],
			selectedIndex: -1
		};

		bindEvents();
	};

	var updateUI = function () {
		$results.html(render(state));
	};

	var setState = function(obj) {
		state = obj;
		updateUI();
	};

	var resetAutocomplete = function(e) {
    if ($input.val() === '') $cancel.hide();

		setState({
			results: [],
			displayResults: [],
			selectedIndex: -1
		});    
	};

	var cancelInput = function(e) {
		resetAutocomplete();
		$input.val('');

		if (typeof e !== 'undefined' && e.type === 'click') { 
			$input.trigger('focus');
		}
	};

	var selectChoice = function(index) {
    $input.val(state.results[index]);
  };

  var render = function(state) {
  	return state.displayResults.map(function(res, i) {
  		var selected = (i === state.selectedIndex)? 'selected' : '';

  		return '<li class="'+ selected +'">' + 
  						'<i class="icon-map-marker"></i>' +
  						'<span class="text">'+ res + '</span>' +
  					 '</li>';
  	}).join('');
  };

  var preventCursorFlickering = function(e) {
  	if (e.keyCode === KEYBOARD.UP) {
  		return false;
  	}  
  };
  
  var dataAdapter = function(results) {
  	return results.map(function(res) {
  		return [
  			res.name, 
  			res.admin2_name, 
  			res.admin1_name, 
  			res.country_name
  		].filter(function(item) {
  			return !!item;
  		}).join(', ');
  	});
  };
  
  var displayDataAdapter = function(results) {
  	return results.map(function(res) {
  		return [
  			res._highlightResult.name.value, 
  			res.admin2_name, 
  			res.admin1_name, 
  			res.country_name
  		].filter(function(item) {
  			return !!item;
  		}).join(', ');
  	});
  };
  
  var autocompleteSearch = function(e) {

  	switch (e.keyCode) {
  		case KEYBOARD.UP:        
	  		setState({ 
	  			results: state.results,
	  			displayResults: state.displayResults,
	  			selectedIndex: state.selectedIndex > 0? 
	  			state.selectedIndex - 1 : 0
	  		});

	  		selectChoice(state.selectedIndex);        
	  		break;

  		case KEYBOARD.DOWN:        
	  		setState({ 
	  			results: state.results,
	  			displayResults: state.displayResults,
	  			selectedIndex: state.selectedIndex < state.results.length - 1? 
	  			state.selectedIndex + 1 : state.results.length - 1
	  		});

  			selectChoice(state.selectedIndex);
  			break;

  		case KEYBOARD.ENTER:
  			selectChoice(state.selectedIndex);
  			resetAutocomplete();
  			break;

  		default:
  			var q = $input.val();

	  		if (q !== '') {
	  			$cancel.show();

	  			index.search(q, {
	  				hitsPerPage: 5,
	  				facets: '*'
	  			}).then(function(results) {
	  				setState({ 
	  					results: dataAdapter(results.hits),
	  					displayResults: displayDataAdapter(results.hits),
	  					selectedIndex: -1 
	  				});
	  			});
	  		} else {
	  			$cancel.hide();
	  			cancelInput();
	  		}
  	}
  };
  
  return {
  	init: init
  };
};