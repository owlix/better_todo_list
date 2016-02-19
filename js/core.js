var items = [];

var clients = [
	'Client 1',
	'Client 2',
	'Client 3',
	'Client 4',
	'Client 5',

];

var dates = [
	'Today',
	'Tomorrow',
	'Two Days',
	'Three Days'
];


var increment = 0;

var allData = {
	'items': items,
	'increment': increment
};

//core functions
$(document).ready(function() {

	$('#sort').on('change', function(){	
		generateItems(items, parseInt($(this).val()));
	});
	
	//load any stored items
	getFile();
	
	//add clients to select dropdown
	displayClients('#client');
	addDateLabels('#date');


	//Make items sortable and update array position
	$('#todo .list').sortable({  

		//fix issue where css transitions affect performance of dragging
		start: function(event, ui){
				
			$('.list li').css('transition', 'inherent ');

		},

		stop: function(event, ui){
			
			$('.list li').css('transition', 'all ease 200ms');
		},

    	update: function(event, ui) {
    		
    		$( ".list li" ).each(function( index ) {

    			var itemId = parseInt(this.id);

    			console.log(itemId + ' : ' + index )
    			
			  	updateKey(itemId, 'order', index);
			});
    		
    		writeFile(items, increment);
	
    	}
          
	});

	//add new item
	$('#addItem').on('click', function(){
		getFormVals();
	});

	$('#title').keypress(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		
		if(keycode == '13'){
			getFormVals();
		}
	});

	$('#add').on('click', function(){

		$('#addform').toggleClass('show');
		$('#title').focus();

	});

	//update checked param
	$(document).on('click','li .checkbox-custom-label', function(){
		
		var isChecked = $(this).parent('li').find('.checkbox');
		var itemId = parseInt($(this).parent('li').attr('id'));

		if ($(isChecked).attr('checked')){
			$(this).removeAttr('checked');
			updateKey(itemId, 'checked', false);

		} else {
			$(isChecked).attr('checked');
			updateKey(itemId, 'checked', 'checked');
		}

		writeFile(items, increment);

		generateItems(items);

	});

	//delete item via close button
	$(document).on('click', '.close', function(){
		
		var thisId = $(this).parent().attr('id');

		deleteItem(thisId);
	
	});

	//show/hide remove button if checked
	$(document).on({
		mouseenter: function(){

			$(this).addClass('info-hover');
			
			var isChecked = $(this).find('.checkbox');
			
			if ($(isChecked).is(':checked')){
				$(this).find('.options').css('visibility', 'visible');
			}
		},

		mouseleave: function(){

			$(this).removeClass('info-hover');
			
			$(this).find('.options').css('visibility', 'hidden');	
		}

	},'.task-body .list li');

	$(document).on('click', '.title', function(){
		var title = $(this);
		console.log(title);
		changeTitle(title);

	});

	$(document).on('keypress', '.title', function(event){
		
			var keycode = (event.keyCode ? event.keyCode : event.which);
			var itemId = $(this).parent().parent().attr('id');
			var itemValue = $(this).find('input').val();

		
			if(keycode == '13'){
				updateKey(itemId, 'title', itemValue);
				console.log($(this).parent().parent());
				writeFile(items, increment);
				generateItems(items);
			}
		
	});

	// needs more work to get pass values and save
	/*$(document).on('click', '.dateselect', function(){
		console.log('clicked dateselect');
		changeDate($(this));
	});*/

});

function Item(id, title, client, checked, order, date) {
	this.id = id;
	this.title = title;
	this.client = client;	
	this.checked = false;
	this.order = order;	
	this.date = date;
}

function addItem(id, title, client, checked, order, date){

	var item = new Item(id, title, client, checked, order, date);
	increment = increment + 1;
	items.push(item);
	
	writeFile(items, increment);

	generateItems(items);
}

function deleteItem(id){
	
	var itemId = parseInt(id);
	
	for (i=0; i < items.length; i++){
		
		if (itemId === items[i].id) {

			var position = itemIndex(items[i]);
			
			items.splice(position, 1);
		}
	}

	writeFile(items, increment);
	
	generateItems(items);

}

function generateItems(list, sort){
	var items = list;

	sortBy(sort);

	/*items.sort(function(a, b) {
    	return a.order - b.order;
	});*/

	$('#todo .list').html('');

	for(i=0; i<items.length; i++){
		var duedate = checkDate(items[i].date);
		
		var newItem = '<li id="' + items[i].id + '"><input class="checkbox checkbox-custom" type="checkbox"' + items[i].checked + '><label class="checkbox-custom-label"></label><div class="info-holder"><span class="title">' + items[i].title + '</span><span class="dateselect">' + items[i].client + ' - ' + duedate + '</div><span class="options close"></span></li>';
		$('#todo .list').append(newItem);

	}

}

function itemIndex(item){
	
	var thisItem = item;
	var position = items.indexOf(thisItem);

	return position;
}

function updateKey(id, key, value){

	var itemId = parseInt(id);
	var itemKey = key;
	var keyVal = value;

	for (i=0; i < items.length; i++){
		
		if (itemId === items[i].id) {

			items[i][itemKey] = keyVal;
		}
	}

}

function getFile(){
		
		//var data = $.parseJSON(localStorage.getItem('item'));
		
		//items = data.item;
					
		//increment = data.increment;


		$.ajax({
		  	type: "GET",
			url: 'getData.php',
			success: (function(data){
				
				if (data != '') {
					
					var returnedData = $.parseJSON(data);

					items = returnedData.item;
					
					increment = returnedData.increment;

					if (items.length < 1 ){
						$('#addform').addClass('show');

					} 
				}else {
						items = [];
						$('#addform').addClass('show');
				}


				
				generateItems(items);

			})
		
		});
		//$('#addform').addClass('show');
		//generateItems(items);
}

function writeFile(item, inc){
	
	var bigData = {
		'item': item,
		'increment': inc
	};

	var data = {'item': JSON.stringify(JSON.stringify(bigData))};

	//localStorage.setItem('item',  JSON.stringify(bigData));

	$.ajax({
	  	type: "POST",
		url: 'write-to-file.php',
		data: data,
		success: (function(){
		})
	
	});
}

function getFormVals(){
	var id = increment;
	var title = $('#title').val();
	var client = $('#client').val();
	var date = $('#date').val();
	console.log(date);
	var checked = false;
	var order = items.length;
	addItem(id, title, client, checked, order, dueDate(date));
	$('#addform').removeClass('show');
	$('#title').val('');
}

function displayClients(element){
	for (i=0;i<clients.length;i++){
		var options = options + '<option>' + clients[i] + '</option>';
	}

	$(element).append(options);
	
}

function dueDate(date){
	
	var newDueDate = '';

	if (date === '0'){
		
		newDueDate = moment().format('MM/DD/YYYY');

	}else if (date === '1'){
		
		newDueDate = moment().add(1, 'd').format('MM/DD/YYYY');

	}else if (date === '2'){

		newDueDate = moment().add(2, 'd').format('MM/DD/YYYY');

	}else if (date === '3') {

		newDueDate = moment().add(3, 'd').format('MM/DD/YYYY');

	}

	return newDueDate;

}

function checkDate(itemDate){
	
	if (itemDate === moment().format('MM/DD/YYYY')){
		
		return 'Due Today!';
	
	} else if (itemDate === moment().add(1, 'd').format('MM/DD/YYYY')){
		
		return 'Due Tomorrow';

	} else if (itemDate === moment().add(2, 'd').format('MM/DD/YYYY') || itemDate === moment().add(3, 'd').format('MM/DD/YYYY')){
		
		return 'Due Soon';

	}


}


function sortBy(choice){

	if (choice === 1) {
		items.sort(function(a, b) {

    		return moment(a.date, 'MM/DD/YYYY').isAfter(b.date, 'MM/DD/YYYY');
		});
	} else if (choice === 2) {
		items.sort(function(a, b) {
			
    		if(a.client < b.client) return -1;
    		if(a.client > b.client) return 1;
    		return 0;
		});

	}else {
		items.sort(function(a, b) {
    		return a.order - b.order;
		});
	}
	
}

function changeTitle(title){
	var thisClass = $(title).attr('class');
	var titletext = $(title).text();
	$(title).html('<input type="text" />');
	$(title).find('input').val(titletext);
	$(title).find('input').focus();

}

//TODO come up with way to pass values to item in array.
//need to revert to span after selection
function changeDate(element){
	
	$(element).data('clicked', true);
	
	for (i=0;i<dates.length;i++){
		var options = options + '<option value="' + [i] + '"">' + dates[i] + '</option>';
	}

	$(element).html('<select>' + options + '</select>');

	$('.dateselect').on('click', function(){
		var thisDate = dueDate($(this).val());
		var thisId = parseInt($(this).parent().parent().parent().attr(id));

		updateKey(thisId, 'date', thisDate);

		writeFile(items, increment);


	});

	if ($(element).data('clicked') === true){
		
		$(document).off('click', '.dateselect');
		
		
	}else {
		console.log('not working');
	}
	
}


function addDateLabels(element){
	for (i=0;i<dates.length;i++){
		var options = options + '<option value="' + [i] + '"">' + dates[i] + '</option>';
	}

	$(element).append(options);
}


