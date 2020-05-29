<?
    include_once("../../index.php");
    APILevel::Need(APILevel::student);

    ValueCheck::String($_GET["application_name"], "어플리케이션 이름을 입력해주세요.", ValueCheck::Option_NotSpace);

    $user = UserInfo::GetInstance();
    $token = IOTApplication::GetToken($user, $_GET["application_name"]);
    $iotApplication = new IOTApplication($token);

    if ($iotApplication->vaildation == false)
        ErrorExit("토큰이 유효하지 않습니다.");

    $resultMessage->application_name = $iotApplication->name;
    $resultMessage->token = $token;
    $resultMessage->description = $iotApplication->description;
    /*
    $list = $iotApplication->GetValueList();
    
    foreach($list as $aa) {
        $aa->last_data = $iotApplication->Read($aa->name,1)[0];

        if ($aa->type == IOTValueType::v_number)
        {
            $aa->statistics = $iotApplication->GetValueStatistics($aa->name, "count");
        }
    }
    $resultMessage->values = $list;
    */
    $resultMessage->layout = $iotApplication->Statistics();

?>