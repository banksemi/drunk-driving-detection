<?
    include_once("../index.php");
    APILevel::Need(APILevel::student);
    
    $user = UserInfo::GetInstance();
    $resultMessage->id = $user->id;
    $resultMessage->branch_name = $user->branch_name;
    $resultMessage->name = $user->name;
    
?>