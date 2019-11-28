<?
    include_once("../index.php");
    APILevel::Need(APILevel::guest);

    session_destroy();
?>