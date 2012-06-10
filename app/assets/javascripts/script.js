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
	$('#heater').live("click", function(){
		if ($(this).attr('checked')) {
	        $.get("http://10.55.25.14:8000/control?id=lamp_1&state=off", function(data) {
			    console.log("yay", data);
			});
	    } else {
			$.get("http://10.55.25.14:8000/control?id=lamp_1&state=on", function(data) {
			    console.log("yay", data);
			});
		}	
	})
});

$(function(){	
	$('#fan').live("click", function(){
		if ($(this).attr('checked')) {
	        $.get("http://10.55.25.240:8000/control?id=fan&state=on", function(data) {
			    console.log("yay", data);
			});
	    } else {
			$.get("http://10.55.25.240:8000/control?id=fan&state=off", function(data) {
			    console.log("yay", data);
			});
		}	
	})
});

$(function(){	
	$('#heater').live("click", function(){
		if ($(this).attr('checked')) {
	        $.get("http://10.55.25.14:8000/control?id=lamp_1&state=on", function(data) {
			    console.log("yay", data);
			});
	    } else {
			$.get("http://10.55.25.14:8000/control?id=lamp_1&state=off", function(data) {
			    console.log("yay", data);
			});
		}	
	})
});

