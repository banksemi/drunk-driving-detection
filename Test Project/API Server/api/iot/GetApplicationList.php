<?
    include_once("../../index.php");
    APILevel::Need(APILevel::student);

    $user = UserInfo::GetInstance();
    $list = array();
    $result = Mysql::Open("SELECT `application_name`, `description`,`date`, iot_token_n.`token`, `last_update` 
        FROM iot_token_n 
            LEFT JOIN iot_last_update
        ON iot_token_n.`application_no` = iot_last_update.`application_no`
        WHERE `user_id`=?", 
        $user->id
    );
    while ($row = $result->fetch_assoc())
    {
        $data = new stdClass();
        $data->application_name = $row["application_name"];
        $data->description = $row["description"];
        $data->date = $row["date"];
        $data->last_update = $row["last_update"];
        $data->token = $row["token"];
        array_push($list, $data);
    }
    $resultMessage->list = $list;
?>