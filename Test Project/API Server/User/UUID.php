<?
    class UUID
    {
        const v_number = 0;
        const v_string = 1;
        const v_boolean = 2;
        const v_color = 3;

        public static function UUIDLogin($type = self::v_number)
        {
            $UUID = null;

            if ($_POST["uuid"] != null) $UUID = $_POST["uuid"];
            if ($_GET["uuid"] != null) $UUID = $_GET["uuid"];
        
            if ($UUID != null) {
                $_SESSION["uuid"] = $UUID;
                $t = UserInfo::InstanceFromUUID($UUID);
                if ($t->id == null) {
                    UserInfo::Create($UUID, $UUID, "MAIN");
                    $_SESSION["id"] = $UUID;
                    #APILevel::Need(APILevel::guest);
                    #ErrorExit("UUID 코드가 올바르지 않습니다");
                }
                else {
                    $_SESSION["id"] = $t->id;
                }
            }

        }
    }
?>