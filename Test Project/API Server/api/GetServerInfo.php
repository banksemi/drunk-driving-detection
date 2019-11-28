<?
    include_once("../index.php");
    APILevel::Need(APILevel::guest);
    
    $resultMessage->server_info = ServerInfo::Information();
?>