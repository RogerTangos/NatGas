<?php
if($_POST)
{
    //check if its an ajax request, exit if not
    if(!isset($_SERVER['HTTP_X_REQUESTED_WITH']) AND strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {
        die();
    } 
    //** Replace with recipient email address
    $to_Email       = "dare639@hotmail.com";
	//** Subject line for emails
    $subject        = 'Ah!! My email from Somebody out there...'; 
    //** Enter your custom alert messages
	$error_userName = 'Please enter your name!';
	$error_email = 'Please enter a valid email!';
	$error_message = 'Your message is too short! Please enter more!';
	$success = 'thank you for your message!';
	$not_sent = 'Something went wrong! Could not send the mail. Sorry...';
	
	
    //check $_POST vars are set, exit if any missing
    if(!isset($_POST["name"]) || !isset($_POST["email"]) || !isset($_POST["message"]))
    {
        die();
    }

    //Sanitize input data using PHP filter_var().
    $user_Name        = filter_var($_POST["name"], FILTER_SANITIZE_STRING);
    $user_Email       = filter_var($_POST["email"], FILTER_SANITIZE_EMAIL);
    $user_Message     = filter_var($_POST["message"], FILTER_SANITIZE_STRING);
    
    //additional php validation
    if(empty($user_Name)) // If length is less than 4 it will throw an HTTP error.
    {
		echo('<div class="alert alert-danger alert-dismissable fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong>Error! </strong>'.$error_userName.'</div>');
        header('HTTP/1.1 500 Name is too short or empty!');
        exit();
    }
    if(!filter_var($user_Email, FILTER_VALIDATE_EMAIL)) //email validation
    {
		echo('<div class="alert alert-danger alert-dismissable fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong>Error! </strong>'.$error_email.'</div>');
        header('HTTP/1.1 500 Please enter a valid email!');
        exit();
    }
    if(strlen($user_Message)<5) //check emtpy message
    {
		echo('<div class="alert alert-danger alert-dismissable fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong>Error! </strong>'.$error_message.'</div>');
        header('HTTP/1.1 500 Too short message! Please enter something.');
        exit();
    }
    
    //proceed with PHP email.
    $headers = 'From: '.$user_Email.'' . "rn" .
    'Reply-To: '.$user_Email.'' . "rn" .
    'X-Mailer: PHP/' . phpversion();
    
	$full_message = 'From: '.$user_Name." (".$user_Email.") \n\n".$user_Message."\n\n".$user_Name;
	
    @$sentMail = mail($to_Email, $subject, $full_message, $headers);
    
    if(!$sentMail)
    {
		echo('<div class="alert alert-danger alert-dismissable fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong>Error! </strong>'.$not_sent.'</div>');
        header('HTTP/1.1 500 Couldnot send mail! Sorry..');
        exit();
    }else{
		echo('<div class="alert alert-success alert-dismissable fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong>Message sent! </strong>Hi '.$user_Name .', '.$success.'</div>');
    }
}
?>