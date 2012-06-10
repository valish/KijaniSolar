/* Browser Resolution 
==========================================================*/

function adjustStyle(width) {
    width = parseInt(width);
    if (width < 1150) {
        $('body').removeClass('bw640').removeClass('bw1024').removeClass('bw1280');
		$('body').addClass('bw1024');
    } else {
       	$('body').removeClass('bw640').removeClass('bw1024').removeClass('bw1280');
		$('body').addClass('bw1280');
    }
	if (width < 700) {
        $('body').removeClass('bw640').removeClass('bw1024').removeClass('bw1280');
		$('body').addClass('bw640');
    } 
}

$(function() {
    adjustStyle($(this).width());
    $(window).resize(function() {
        adjustStyle($(this).width());
    });
});


/* Toggle Appliances 
==========================================================*/

$(function(){
	$('#heater').click(function(){
		alert('toggle heater');
	})
	$('#living_room').click(function(){
		alert('toggle living room')
	})
	$('#washer').click(function(){
		alert('toggle washer')
	})
	$('#dryer').click(function(){
		alert('toggle dryer')
	})
})

