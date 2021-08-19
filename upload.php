<?php
//-----------------------------------------------------------------------------------------------------------------
// Configuration here
//-----------------------------------------------------------------------------------------------------------------

$currentpwd = "Orcs2021";
$enabled = true;
//-----------------------------------------------------------------------------------------------------------------
?>

<html>
<head><title>ORCS Girls File Upload</title></head>
<body>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<link rel="stylesheet" href="/other/Bootstrap-4-4.1.1/css/bootstrap.min.css">
<link rel="stylesheet" href="/styles/theme.css">
<script src="/other/Bootstrap-4-4.1.1/js/bootstrap.min.js"></script>
<script src="/other/jQuery-3.3.1/jquery-3.3.1.min.js"></script>
<script src="/scripts/qrcode.js"></script>

<style>
#qrcode {
	height: 150px;
	width: 150px;
	padding: 50px 20px;
	margin: auto;
}
</style>
<?php
function getName($n) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $randomString = '';
    for ($i = 0; $i < $n; $i++) { $index = rand(0, strlen($characters) - 1); $randomString .= $characters[$index]; }
    return $randomString;
}
//-----------------------------------------------------------------------------------------------------------------
$password="";
if($_SERVER["REQUEST_METHOD"] == "POST"){ $password=$_POST['password']; }

if(!$enabled) {
    echo "<div class='p-3 text-center'><h3>File upload disabled</h3></div>\n";
} else {

if(empty($password) || ($password != $currentpwd)) {
?>
    <div class="p-3 text-center">
        <h3>File Upload</h3>
        <p>Please select the file to upload and enter the password given by the instructor.</p>
	<form class="form justify-content-center" enctype="multipart/form-data"
              action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
            <div class="form-group row my-2">
    		<input class="form-control" id="file" type="file" name="file" />
	    </div>
            <div class="form-group row my-2">
                <input type="password" name="password" class="form-control" placeholder="Password" size="20" required>
            </div>    
            <div class="form-group my-2">
                <input type="submit" id="html5-upload-button" class="btn btn-primary" value="Upload">
            </div>
        </form>
    <?php  if ($password && ($password != $currentpwd)) {echo '<p class="text-danger">Password incorrect. Try again</p>';} ?>
    </div>    

<?php
} else {
	$filename = $_FILES['file']['name'];
	$random = getName(10);
	$location = 'uploads/'.$random.$filename;

	if ( move_uploaded_file($_FILES['file']['tmp_name'], $location) ) {
?>
    <div class="p-3 text-center">
    <h3>Success</h3>
    <div class="text-center"><a target="_blank" href="<?php echo $location;?>">
	 <?php echo 'https://microbit.orcsgirls.org/'.$location; ?></a>
	 <div id="qrcode"></div>
	 <script>var qrcode = new QRCode("qrcode",{width:150, height:150});
		qrcode.makeCode("https://microbit.orcsgirls.org/<?php echo $location;?>");
	</script>
    </div>
<?php
	} else {
    	  echo "<div class='p-3 text-center'><h3>File upload failed ..</h3></div>\n";
	}
}}
?>
</body>
</html>
