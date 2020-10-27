function check() {
	// Get Values
	var email  = document.getElementById('name' ).value;
    var password    = document.getElementById('type'   ).value;
	
	if(email.length == 0) {
		alert("Please enter pet name");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(password.length == 0) {
		alert("Please enter pet type");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}