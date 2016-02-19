<?php

//$data = $_GET[$current];

$file = 'items.txt';
// Open the file to get existing content
$current = file_get_contents($file);

echo $current;
?>
