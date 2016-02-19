<?php

$data = $_POST["item"];

$newdata = json_decode($data);

$file = 'items.txt';

$current = json_decode($data);
// Write the contents back to the file
file_put_contents($file, $current);
?>