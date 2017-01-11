<?php
    $ip = getenv('HTTP_CLIENT_IP')?:
    getenv('HTTP_X_FORWARDED_FOR')?:
    getenv('HTTP_X_FORWARDED')?:
    getenv('HTTP_FORWARDED_FOR')?:
    getenv('HTTP_FORWARDED')?:
    getenv('REMOTE_ADDR');


    $output = file_get_contents("http://api.geoiplookup.net/?query=216.229.231.109");
    $xml = simplexml_load_string($output);
    $json = json_encode($xml);
    print($json);
?>