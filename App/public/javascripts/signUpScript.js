function check() {
	// Get Values
	var email  = document.getElementById('email' ).value;
	var password    = document.getElementById('password'   ).value;
	var password2    = document.getElementById('password2'   ).value;
	var firstname    = document.getElementById('firstname'   ).value;
	var lastname    = document.getElementById('lastname'   ).value;
	var address    = document.getElementById('address'   ).value;
	
	if(!(email && password && password2 && firstname && lastname && address)) {
		alert("Please enter all fields");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if(password.length < 6) {
		alert("Password is too short/n Please ensure password has more than 6 characters");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
	if (password != password2) {
		alert("Passwords do not match");
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
}