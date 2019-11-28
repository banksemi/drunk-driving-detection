<?
    include_once("../../index.php");
    APILevel::Need(APILevel::student);

    ValueCheck::String($_GET["application_name"], "어플리케이션 이름을 입력해주세요.", ValueCheck::Option_NotSpace);

    $user = UserInfo::GetInstance();
    $token = IOTApplication::GetToken($user, $_GET["application_name"]);
    $iotApplication = new IOTApplication($token);

    if ($iotApplication->vaildation == false)
        ErrorExit("토큰이 유효하지 않습니다.");

    $resultMessage->list = $iotApplication->GetValueList();
?>