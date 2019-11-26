<?
// https://easyweb.easyrobot.co.kr/api/AutoUpdate.php
    include_once("./index.php");
    APILevel::Need(APILevel::guest);
    if (Setting::$AutoUpdateSecretKey != null)
    {
        if ($_POST["key"] !== Setting::$AutoUpdateSecretKey)
        {
            ErrorExit("잘못된 요청입니다.");
        }
    }
    IOTStatistics::Update();
?>