function check() {
	// Get Values
	var email  = document.getElementById('email' ).value;
    var password    = document.getElementById('password'   ).value;
	
	if(email.length == 0) {
		alert("Please enter email");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(password.length == 0) {
		alert("Please enter password");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}