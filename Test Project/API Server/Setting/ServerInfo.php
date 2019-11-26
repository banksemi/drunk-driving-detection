<?
    class ServerInfo
    {
        public static $site_name = "사이트 이름";
        public static $footer_message = "PHP API 서버에서 footer 메세지를 수정해주세요.";
        public static function Information()
        {
            $result = new stdClass();
            $result->site_name = self::$site_name;
            $result->footer_message = self::$footer_message;
            return $result;
        }
    }
?>