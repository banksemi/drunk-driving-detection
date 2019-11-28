<?
    include_once("../../index.php");
    APILevel::Need(APILevel::student);
    
    ValueCheck::String($_POST["application_name"], "어플리케이션 이름을 입력해주세요.", ValueCheck::Option_NotSpace);

    $user = UserInfo::GetInstance();

    $token = IOTApplication::GetToken($user, $_POST["application_name"]);

    $iotApplication = new IOTApplication($token);
    if ($iotApplication->vaildation == false)
    {
        ErrorExit("어플리케이션이 존재하지 않습니다.");
    }
    $result = $iotApplication->DeleteApplication();
    if ($result != 0)
    {
        ErrorExit("어플리케이션을 삭제할 수 없습니다.");
    }
    else
    {
        $resultMessage->message = "어플리케이션이 삭제되었습니다.";
        $resultMessage->application_name = $_POST["application_name"];
    }
?>