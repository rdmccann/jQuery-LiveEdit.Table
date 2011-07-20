(function( $ ){
	/*
	 *	Options
	 */
	var options = {
		activeBorderColor   : "#333",
		dbFunctionsBASE_URL : "admin/"
	}
	
	
	/*
	 *	Methods
	 *	INIT is default
	 */
	 
	var methods = {
		init: function( options ) {
			this.wrap('<form></form>');
			
			this.editTable('addEditRow');
			
			this.editTable('addTableListeners');
			
			$('#rowhover').hide();
		},
		addEditRow: function() {	
			var newRow = '<tr id="new">';
			for (var x = 0, xl = $('th').length; x < xl; x++) {
				newRow += '<td><input autocomplete="off" value="" style="text"></td>';
			}
			newRow += '</tr>';
			this.find('tbody').append(newRow);
			this.find('input').editTable('listenToMe');
			$('#new input:first').focus();
		},
		addTableListeners: function() {
				
			/*
			 *	Show Edit INPUT in existing row
			 */
			 
			this.find('td').dblclick(
				function() {
					if( $(this).children().length == 0 ) {
						$(this).html('<input style="text" value="' + $(this).html() + '" />').css({padding:'2px'});
						$(this).children('input').editTable('listenToMe');
						$(this).children('input').focus();
					}
				}
			);
			
			
			/*
			 *	Row Hover
			 */
			 
			this.find('tbody').children().mouseenter(function(){
				/*
				 *	Mouse ENTER TR handler
				 */
				var trPosition = $(this).offset();
				$('#rowhover').show();
				$('#rowhover').css( {left: trPosition.left - 10 , top: trPosition.top - 5} );
			});
			
			this.mouseleave(function(){
				/*
				 *	Mouse LEAVE:TABLE handler
				 */
				$('#rowhover').hide();
			});
		},
		listenToMe: function() {
		
			/*
			 *	INIT Vars
			 */
			 
			var originalValue        = this.val();
			var originalBorderColor  = this.css('border-color');
			var originalPadding      = this.css('padding');
			var data                 = new Object();
			
			
			/*
			 *	Register Listeners
			 */
			
			this.change(
				function(me) { listenTo(me); }
			).keydown(
				function(me) { listenTo(me); }
			).focus(
				function(me) { listenTo(me); }
			).blur(
				function(me) { listenTo(me); }
			);
			
			
			/*
			 *	Listener
			 */
			 
			function listenTo(me) {
				
				
				/*
				 *	Global/Basic Form Setup Vars
				 */
				 
				var origin     = $(me.target);
				var value 	   = $(origin).val().trim();
				//var que            = $().Deferred();
				
				/*
				 *	in Table Setup Vars
				 */
				
				if ( origin.parent().is('td') || origin.parent().is('th') ) {
					/*
					 *	input is in a table
					 */
					var thisCell       = origin.parent('td');
					var rowCells       = thisCell.parent('tr').children();
					var cellIndex      = rowCells.index( thisCell );
				    var thead          = thisCell.parents('table').find('th');
					var column         = $( thead[cellIndex] ).attr('id');
					var row            = origin.closest('tr');
					    row.id 	       = row.attr('id');
					    row.isNew      = row.id == 'new' ? true:false;
					    row.isComplete = true;
					
					$('#new input').each( function(){ 
						if ( $(this).val().length == 0 ){ 
							row.isComplete = false;
						}
					});
				}
				
				
				/*
				 *	Destroy Input;  Doesn't have to handle New Row Blurs
				 */
				 
				function destroyInput(val, target){
					if(!val){ val = originalValue; }
					if(!target){ target = origin.parent(); }
					console.log(target);
					target.html( val ).css( {padding: originalPadding} );
				}
				
				
				/*
				 *	Decision Tree
				 */
				 
				//console.log({type: me.type, origin: origin, isComplete: row.isComplete});
				
				switch (me.type){
					case 'keydown':
						/*
						 *	@TODO on alpha-numeric keyups, ajax autocomplete
						 */
						var whichKeyCode = me.keyCode ? me.keyCode : me.which;
						switch(whichKeyCode) {
							case 13:  // return key
								if(row.isNew  && !row.isComplete){
									var nextInput  = cellIndex  == rowCells.index( $('#new input:last').parent() ) ? $('#new input:first') : thisCell.next().children('input') ;
									nextInput.focus();
									origin.blur();
								}
								break;
								
							case 27: // escape key
								if(row.isNew){
									$(origin).val( originalValue );
								} else {
									destroyInput();
								}
								origin.blur();
								break;
						}
						break;
					
					case 'change':
						data[column] = value;
						console.log(data);
						
						if(row.isNew && row.isComplete){
							$.post( "admin/n", data, function(response){
								/*
								 *	response is the id of the freshly inserted row.
								 */
								$( origin.closest('tr') )
								.attr( 'id', response )
								.children().each(
									function(){
										destroyInput( $(this).children('input').val(), $(this) );
									}
								);
								$().editTable('addEditRow');
							});
						} else if (!row.isNew) {
							data['rowid'] = row.id;
							
							$.post( "admin/u", data, function(){
								console.log(this);
								$(origin)
								.animate({
									borderColor: "#70DB70", 
									backgroundColor: "#C2F0C2"
								}, 100)
								.fadeOut(
									function(){
										destroyInput( origin.val() );
									}
								);
							});
						}
						break;
					
					case 'focus':
						origin.css('border-color', options.activeBorderColor);
						break;
						
					case 'blur':
						if( row.isNew && !row.isComplete){
							origin.css('border-color', originalBorderColor);
						} else {
							destroyInput();
						}
						break;
				}
			}
		}
	};
	
	
	
	/*
	 *	Method calling logic
	 */
	
	$.fn.editTable = function( method ) {
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
		}
	}
})( jQuery );